// @flow-

/*eslint-disable no-alert, no-unused-expressions */
import { compose, merge } from './utilities';
import {
  Logary,
  getLogger,
  thenTarget,
  build,
  Message,
  onerror,
  lessThan,
  Targets,
  minLevel,
  messageId,
  stacktrace,
  stubTarget,
  defaultTarget,
  VERBOSE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
} from './index';
import * as logaryM from './index';
import type { MessageType } from './index';
import { createRequest, getContent, emptyResponse } from './request';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import jsSHA from 'jssha';
import StackTrace from 'stacktrace-js';

// support Promise
chai.use(chaiAsPromised);

describe('(Library) Logary', function() {
  describe('initialisation', function() {
    var logary = null;

    beforeEach(function() {
      logary = new Logary('MyWebSite', stubTarget);
    });

    it('should be newable', function() {
      expect(logary).to.not.be.null;
    });
  });

  describe('#compose', function() {
    it('calls its functions', function() {
      const a = x => x + 1,
            b = x => x + 3,
            c = x => x + 7,
            f = compose(a, b, c);
      expect(f).to.be.a('function');
      expect(f(1)).to.equal(12);
    });

    it('can compose higher order f-ns', function() {
      const calls = [],
            m1 = next => x => { calls.push('m1'); return next(x); },
            m2 = next => x => { calls.push('m2'); return next(x); },
            f3 = y => { calls.push('f3'); return y + 1; };

      const f = compose(m1, m2)(f3);
      expect(f(2)).to.equal(3);
      expect(calls).to.deep.equal(['m1', 'm2', 'f3']);
    });

    it('cannot take end function of different signature', function() {
      const calls = [],
            m1 = next => x => { calls.push('m1'); return next(x); },
            m2 = next => x => { calls.push('m2'); return next(x); },
            f3 = y => { calls.push('f3'); return y + 1; };

      // this does not work, because m2(f3(2)) turns into
      // m2(2)
      // x => 2(x)
      const callsxx = [], fxx = compose(m1, m2, f3);
      expect(fxx(2)).to.be.a('function');
      expect(callsxx).to.deep.equal([]);
      expect(() => fxx(2)(2)).to.throw();
    });
  });

  describe('Message', function() {
    it('has #create', function() {
      expect(Message.create).to.be.a('function');
    });

    it('#create can be called', function() {
      const subject = Message.create({
        template: 'Hello World'
      });

      expect(subject.level).to.equal('debug');
    });

    it('#event can be called', function() {
      expect(Message.event).to.be.a('function');
    });

    it('#event defaults to info', function() {
      const m = Message.event('User Signed In');
      delete m['timestamp'];
      expect(m).to.deep.equal({
        name: "",
        value: 'User Signed In',
        level: INFO,
        fields: {},
        context: {}
      });
    });

    it('#eventError can be called', function() {
      const err = new Error('BOOM!'),
            msg = Message.eventError('Window OnError', err);
      expect(msg).to.not.be.null;
      expect(msg.fields.errors).to.have.lengthOf(1);
    });
  });

  describe('getLogger', function() {
    var logary, logger;

    beforeEach(function() {
      logary = new Logary('MyWebSite', stubTarget);
      logger = getLogger(logary, 'AreaX.ComponentA');
    });

    it('exists', function() {
      expect(logger).to.not.be.null;
    });

    it('return value can be called', function() {
      expect(logger).to.be.a('function');
    });

    it('calls Logary middleware', function() {
      const calls = [];

      const mid = next => msg => {
        calls.push('middleware');
        return next(msg);
      };

      const mgr = new Logary('MySite', stubTarget, mid);

      const lgr = getLogger(mgr, 'Comp'),
            msg = Message.event('Happening'),
            subj = lgr(msg);

      expect(subj.value).to.equal('Happening');
      expect(calls).to.deep.equal([
        'middleware'
      ]);
    });

    it('can receive Message', function() {
      const msg = logger(Message.create({
        template: 'Hello World'
      }));

      expect(msg).to.be.an('object');
    });

    it('can be composed', function() {
      const enricher = next => msg => merge(msg, {
        context: {
          principal: 'haf'
        }
      });

      const nextLogger = enricher(logger),
            msg = Message.event('Thing occurred');
      //console.log('nextLogger: ', nextLogger(msg).toString());
      expect(nextLogger(msg)).to.be.a('object');
      expect(nextLogger(msg).context.principal).to.equal('haf');
    });
  });

  describe('composition', function() {
    var logary, logger, logged;
    const enricher = next => msg =>
      next(merge(msg, {
        context: {
          user: 'haf'
        }
      }));

    const enricher2 = next => msg =>
      next(merge(msg, {
        context: {
          lastUtmSource: 'adwords'
        }
      }));

    beforeEach(function() {
      logged = [];
      logary = new Logary('MyWebSite', msgs => { logged.push(msgs); return stubTarget(msgs) });
      logger = getLogger(logary, 'SubA');
      expect(logger).to.be.a('function')
      logger = enricher(logger);
      expect(logger).to.be.a('function')
      logger = enricher2(logger);
      expect(logger).to.be.a('function')
    });

    it('enrichers keep function signature', function() {
      expect(logger).to.be.a('function');
      const res = logger(Message.event('Testing'));
      expect(res).to.be.an('object');
    });

    it('#compose creates Logger w/ signature M => M', function() {

      // given
      var calls = [];
      const logger = getLogger(logary, 'AreaY');

      const e1 = next => msg => {
        calls.push('1');
        return next(msg);
      };
      const e2 = next => msg => {
        calls.push('2');
        return msg;
      };

      // sanity check
      const composed = compose(e1, e2)(logger);
      expect(composed).to.be.a('function', 'compose(e1, e2)(logger)');

      // initial order, e1 calls e2
      const output = composed(Message.event('testing'));
      expect(output).to.be.an('object');
      expect(output.value).to.equal('testing');
      expect(calls).to.deep.equal([ '1', '2' ]);

      // other order, e2 doesn't call next
      calls = [];
      const composed2 = compose(e2, e1)(logger);
      const output2 = composed2(Message.event('testing'));
      expect(output2.value).to.equal('testing');
      expect(calls).to.deep.equal([ '2' ]);
    });

    it('#thenTarget calls target in the end', function() {
      const calls = [];
      const composed = thenTarget(logger, msg => {
        calls.push('t');
        return of(emptyResponse);
      });
      const msg = Message.event('Calling Target');
      return Promise.all([
        expect(composed(msg).toPromise()).to.eventually.deep.equal(emptyResponse)
      ]);
    });

    it('#compose composes Messages and loggers', function() {
      const now = Date.now(),
            built = build(logary, logger),
            msg = Message.event('App Loaded', 'info', {
              fieldA: 3,
              'prop': 34
            }),
            out = built(msg);

      expect(built).to.be.a('function');
      expect(out).to.be.instanceof(Observable, 'Should return an Observable: ' + String(out));

      const output = out.pipe(map(x => ({ ...logged[0], timestamp: now })));
      expect(output).to.be.instanceof(Observable, "Logging after building, should return an Observable");

      return output.toPromise().then(x => {
        expect(x).to.deep.equal({
          name: 'MyWebSite.SubA',
          level: 'info',
          value: 'App Loaded',
          timestamp: now,
          context: {
            service: 'MyWebSite',
            logger: 'SubA',
            user: 'haf',
            lastUtmSource: 'adwords'
          },
          fields: {
            fieldA: 3,
            prop: 34,
            messageId: "e311afba5f641aa8e4dc93c1c424c31e5e17f2b3f4576c3662307c1e37632d7c"
          }
        });
      });
    })
  });

  //////////////////// DOCS: HOW TO USE ///////////////////
  describe('usage', function() {
    it('supports recommended config', function() {
      // once per site/app
      const target = Targets.logaryService({
        path: '/i/site/logary',
        serialise: getContent,
        send: m => /* IRL: lib/request/send */ of(emptyResponse)
      });

      // save this in the app's context; it's a state carrier:
      const logary = new Logary('mysite.com', target);

      // in your module, or in your functions:
      const parentLogger = getLogger(logary, 'MyModule.MySubModule');

      // some middleware for some context in between heaven an earth
      const userIdMid =
        next => msg => next(merge(msg, {
          context: {
            userId: 'haf'
          }
        }));

      // in your innermost context:
      const logger = build(logary, userIdMid(parentLogger));

      // in your functions
      const subject = logger(Message.event('Sign up'));
      expect(subject).to.be.instanceof(Observable);

      return subject.toPromise().then(stubbedValue => {
        expect(stubbedValue).to.deep.equal(emptyResponse);
      });
    });
  });
  ///////////////////// END DOCS //////////////////////////

  describe('LogLevel', function() {
    it('should have #lessThan', function() {
      expect(lessThan).to.be.a('function');
    });
  });

  describe('Middleware', function() {
    describe('LogLevel enricher', function() {
      it('should filter', function() {
        const subject = minLevel(INFO);
        const msg = Message.create({ template: 'test' });
        subject(msg => {
          expect(msg).to.be.null;
        })(msg);
      });
    });

    describe('messageId enricher', function() {
      var logary, logger, emptyHash;

      beforeEach(function() {
        logary = new Logary('MyWebSite', stubTarget);
        logger = getLogger(logary, 'AreaX.ComponentA');
        const hasher = new jsSHA('SHA-256', 'TEXT');
        emptyHash = hasher.getHash('HEX');
      });

      it('should be a function', function() {
        expect(messageId).to.be.a('function');
      });

      it('should accept a message and return a function', function() {
        const msg = Message.create({ template: 'test' });
        expect(messageId(x => x)).to.be.a('function');
      });

      it('should compute a SHA256 HEX message id', function() {
        const msg = Message.create({ template: 'test' });
        const res = messageId(logger)(msg);
        if (res.fields == null || typeof res.fields !== 'object') throw new Error('Fields is null or not an object');
        //console.log(JSON.stringify(res.messageId));
        expect(res.fields.messageId).to.be.a('string');
        expect(res.fields.messageId).to.not.equal(emptyHash);
        expect(res.fields.messageId).to.equal('01842d4956f94554c26d2e1cd431a27c2aef25dd807d60569d5039cfffa02f8b');
      });
    });

    describe('stacktrace enricher', function() {
      const error = new Error("Oh Noes!");

      var logary, logger, emptyHash;

      beforeEach(function() {
        logary = new Logary('MyWebSite', stubTarget, []);
        logger = getLogger(logary, 'AreaX.ComponentA');
      });

      it('should be a function', function() {
        expect(stacktrace).to.be.a('function');
      });

      it('should accept a message and return a function', function() {
        const msg = Message.create({ template: 'test' });
        expect(stacktrace(ignored => msg)).to.be.a('function');
      });

      it('passes through messages without errors', function() {
        const msg = Message.event('Signup');
        const res = stacktrace(logger)(msg);
        expect(res.value).to.equal('Signup');
        expect(res.level).to.equal('info');
        expect(res.fields).to.deep.equal({});
        expect(res.context).to.deep.equal({
          logger: 'AreaX.ComponentA',
          service: 'MyWebSite'
        });
      });

      it('parses errors in generated errors', function(done) {
        const msg = Message.eventError('Uncomfortable Error', error);
        const subjectMsg = stacktrace(logger)(msg);

        if (subjectMsg instanceof Observable) {
          subjectMsg.subscribe(msg => {
            expect(msg.fields).to.be.an('object');
            expect(msg.fields.errors).to.have.lengthOf(1);
            expect(msg.fields.errors[0]).to.not.equal(error);
            expect(msg.fields.errors[0]).to.be.an('Array');
            done();
          }, done);
        } else {
          throw new Error('Expected subjectMsg to be instanceof Observable');
        }
      });

      it('should parse errors into stack traces', function(done) {
        const msg = Message.eventError('Uncomfortable Error', error, {
                myField: 'abc'
              }),
              actual = stacktrace(logger)(msg).pipe(map(x => x.fields));

        Promise
          .all([actual.toPromise(), StackTrace.fromError(error)])
          .then(([ actualFields, expectedError ]) => {
            expect(actualFields.errors[0]).to.deep.equal(expectedError);
            expect(actualFields.myField).to.equal('abc');
            done();
          }, done);
      });
    });
  });

  describe('onerror', function() {
    var logary, logger;

    beforeEach(function() {
      logary = new Logary('MyWebSite', msg => of(msg));
      logger = build(logary, getLogger(logary, 'AreaX.ComponentA'));
    });

    it('should be a function', function() {
      expect(onerror).to.be.a('function');
    });

    it('can be called with logger', function() {
      expect(onerror(logger)).to.be.a('function');
    });

    const err = new Error('BAM!');
    const createMsg: void => Observable<Response> = () =>
      onerror(logger)("XYZ is undefined", "sample.js", 1, 1, err);

    it('can be called with logger + args: Observable', function() {
      const msg = createMsg().toPromise();
      expect(msg).to.eventually.be.fulfilled;
    });

    it('sets .value', function() {
      return createMsg().pipe(map(x => x[0].value)).toPromise().then(value => {
        expect(value).to.equal('XYZ is undefined');
      });
    });

    it('sets level', function() {
      const level = createMsg().pipe(
        map(x => x[0].level)
      ).toPromise();
      expect(level).to.eventually.equal(ERROR);
    });

    it('sets errors', function() {
      return createMsg().toPromise().then(msgs => {
        expect(msgs[0].fields).to.be.an('object');
        expect(msgs[0].fields).not.to.be.undefined;
        expect(msgs[0].fields.errors).to.have.lengthOf(1);
      });
    });

    it.skip('sets the stacktrace', function() {
      const composed = stacktrace(logger);
      const futureMsg = onerror(composed)("XYZ is undefined", "sample.js", 1, 1, err);
      expect(futureMsg).to.be.instanceOf(Observable, "Middleware return observables");

      return futureMsg.toPromise().then(msgs => {
        expect(msgs[0].fields).not.to.be.undefined;
        expect(msgs[0].fields).not.to.be.null;
        expect(msgs[0].fields.errors).to.be.an('Array', `1: was ${typeof msgs[0].fields.errors}, JSON: ${JSON.stringify(msgs[0].fields.errors)}`);
        expect(msgs[0].fields.errors[0]).to.be.an('Array', `2: was ${typeof msgs[0].fields.errors[0]}, JSON: ${JSON.stringify(msgs[0].fields.errors[0])}`);
        expect(msgs[0].fields.errors[0]).to.not.equal(err);
      });
    });

    const createMuted: void => Observable<MessageType> = () =>
      onerror(logger)("Script error.", "", 0, 0, null); // as per the spec

    it('recognises muted errors', function() {
      // See https://stackoverflow.com/questions/5913978/cryptic-script-error-reported-in-javascript-in-chrome-and-firefox
      // Ref https://www.w3.org/TR/html5/webappapis.html#runtime-script-errors point 6
      // and https://www.w3.org/TR/html5/webappapis.html#muted-errors
      const tags = createMuted().pipe(map(x => x[0].fields.tags)).toPromise();
      expect(tags).to.eventually.contain('muted-error');
      expect(tags).to.eventually.contain('window-onerror');
    })
  });

  describe('Targets', function() {
    describe('logaryService', function() {
      var logary, logger, conf, service;

      beforeEach(function() {
        logary = new Logary('MyWebSite', stubTarget);
        logger = getLogger(logary, 'AreaX.ComponentA');
        conf = {
          path: '/i/site/logary',
          // in this test we stub the xmlHttpRequest
          send: req => of(req)
        };
        service = Targets.logaryService(conf);
      });

      it('should be a function', function() {
        expect(service).to.be.a('function');
      });

      it('should accept a message and return a function', function() {
        const msg = Message.create({ template: 'test' });
        expect(service(msg)).to.be.instanceOf(Observable);
      });

      it('returns a proper request', function() {
        const msg = Message.event('Signed Up');
        const now = new Date();
        const inflight = service(msg);

        expect(inflight).to.be.instanceof(Observable, `Inflight ${inflight} should be observable of response`);

        return inflight.toPromise().then(req => {
          const expected =
            createRequest('POST', '/i/site/logary', getContent([{
              name: 'Qvitoo.App',
              value: 'Signed Up',
              fields: {},
              context: {},
              level: 'info',
              timestamp: now
            }]), {
              'Accept': 'application/json'
            });
          expect(req).to.deep.eq(expected);
        });
      });
    });
  });

  describe('serialisation', function() {
    describe('serialise', function() {
      var logary, logger, conf, service, send;

      beforeEach(function() {
        logary = new Logary('MyWebSite');
        logger = getLogger(logary, 'AreaX.ComponentA');
        conf = {
          path: '/i/site/logary',
          // in this test we stub the xmlHttpRequest
          send: req => of(req.content != null ? req.content.body : null)
        };
        service = Targets.logaryService(conf);
        send = build(logary, logger);
      });

      it('serialises in the expected format', function() {
        const expectedEvent = JSON.parse('{"context":{"logger":"AreaX.ComponentA","service":"MyWebSite"},"fields":{},"level":"info","name":"MyWebSite.AreaX.ComponentA","timestamp":1461771997775106000,"value":"a test event"}');

        const actual = send(Message.event('a test event'));

        expect(actual).to.be.instanceOf(Observable, 'Should return an observable');

        return actual.toPromise().then(data => {
          expect(data.timestamp).to.be.a('number');
          expect(data.fields.messageId).to.be.a('string');
          // munge the timestamp to allow comparison
          data.timestamp = expectedEvent.timestamp;
          // munge the messageId to allow comparison
          expectedEvent.fields.messageId = data.fields.messageId;
          expect(data).deep.equal(expectedEvent);
        });
      });
    });
  });
});