/*eslint-disable no-alert, no-unused-expressions */
import {
  default as Logary,
  getLogger,
  compose,
  composeAll,
  thenTarget,
  build,
  Message,
  Normalise,
  Middleware,
  onerror,
  HashUtils,
  Targets,
  LogLevel,
  Compression
} from '../../src/index';
import * as LogaryM from '../../src/index';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import merge from '../../src/internal/merge';
import jsSHA from 'jssha';
import StackTrace from 'stacktrace-js';
const logaryService = Targets.logaryService;
const LZW = Compression.LZW;

// support Promise
chai.use(chaiAsPromised);

describe('Logary', function() {
  describe('initialisation', function() {
    var logary = null;

    beforeEach('create new logary', function() {
      logary = new Logary('MyWebSite');
    });

    it('should be newable', function() {
      expect(logary).to.not.be.null;
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

      expect(subject.level).to.equal('DEBUG');
    });

    it('#event can be called', function() {
      expect(Message.event).to.be.a('function');
    });

    it('#event defaults to INFO', function() {
      expect(Message.event('User Signed In')).to.deep.equal({
        template: 'User Signed In',
        level: 'INFO',
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

    beforeEach('create new logary', function() {
      logary = new Logary('MyWebSite');
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

      const mid = msg => next => {
        calls.push('middleware');
        return next(msg);
      };

      const mgr = new Logary('MySite', null, mid);

      const lgr = getLogger(mgr, 'Comp'),
            msg = Message.event('Happening'),
            subj = lgr(msg);

      expect(subj.template).to.equal('Happening');
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
      const enricher = msg => next => merge(msg, {
        context: {
          principal: 'haf'
        }
      });

      const nextLogger = compose(logger, enricher),
            msg = Message.event('Thing occurred');
      //console.log('nextLogger: ', nextLogger(msg).toString());
      expect(nextLogger(msg)).to.be.a('object');
      expect(nextLogger(msg).context.principal).to.equal('haf');
    });
  });

  describe('composition', function() {
    var logary, logger;
    const enricher = msg => next => {
      const res = next(merge(msg, {
        context: {
          user: 'haf'
        }
      }));
      return res;
    };

    const enricher2 = msg => next => {
      const res = next(merge(msg, {
        context: {
          lastUtmSource: 'adwords'
        }
      }));
      return res;
    };

    beforeEach('create new logary', function() {
      logary = new Logary('MyWebSite');
      logger = getLogger(logary, 'AreaX.ComponentA');
      logger = getLogger(logary, 'SubA');
      logger = compose(logger, enricher);
      logger = compose(logger, enricher2);
    });

    it('#compose creates logger M => M', function() {
      expect(logger).to.be.a('function');
      expect(logger(Message.event('Testing'))).to.be.an('object');
    });

    it('#composeAll creates logger M => M', function() {
      // given
      var calls = [];
      const logger = getLogger(logary, 'AreaY');
      const e1 = msg => next => {
        calls.push('1');
        return next(msg);
      };
      const e2 = msg => next => {
        calls.push('2');
        return msg;
      };

      // sanity check
      const composed = composeAll(logger, e1, e2);
      expect(composed).to.be.a('function');

      // initial order, e1 calls e2
      const output = composed(Message.event('testing'));
      expect(output).to.be.a('object');
      expect(output.template).to.equal('testing');
      expect(calls).to.deep.equal([ '1', '2' ]);

      // other order, e2 doesn't call next
      calls = [];
      const composed2 = composeAll(logger, e2, e1);
      const output2 = composed2(Message.event('testing'));
      expect(output2.template).to.equal('testing');
      expect(calls).to.deep.equal([ '2' ]);
    });

    it('#thenTarget calls target in the end', function() {
      const calls = [];
      const composed = thenTarget(logger, msg => {
        calls.push('t');
        return Promise.resolve('yup');
      });
      const msg = Message.event('Calling Target');
      return Promise.all([
        expect(composed(msg)).to.eventually.equal('yup')
      ]);
    });

    it('#compose composes Messages and loggers', function() {
      const now = Date.now();
      const output = build(logary, logger)(Message.event('App Loaded', 'INFO', {
        fieldA: 3,
        'prop': 34
      })).then(x => ({ ...x, timestamp: now }));

      expect(output).to.be.a('Promise');
      expect(output).to.eventually.deep.equal({
        name: 'MyWebSite.SubA',
        level: 'INFO',
        template: 'App Loaded',
        timestamp: now,
        context: {
          service: 'MyWebSite',
          logger: 'SubA',
          user: 'haf',
          lastUtmSource: 'adwords'
        },
        fields: {
          'fieldA': 3,
          'prop': 34
        }
      });
    });
  });

  //////////////////// DOCS: HOW TO USE ///////////////////
  describe('usage', function() {
    it('supports recommended config', function() {
      // once per site/app
      const target = Targets.logaryService({
        path: '/i/site/logary',
        serialise: LogaryM.createContent,
        send: m => /* IRL: ajax */ Promise.resolve('Sent to server!')
      });

      // save this in the app's context:
      const logary = new Logary('mysite.com', target);

      // in your module, or in your functions:
      const loggerExtras =
        build(
          logary,
          compose(
            getLogger(logary, 'MyModule.MySubModule'),
            msg => next => next(merge(msg, {
              context: {
                userId: 'haf'
              }
            })))),
        logger = build(logary, getLogger(logary, 'MyModule.MySub'));

      // in your functions
      const subject = logger(Message.event('Sign up'));
      expect(subject).to.eventually.be.equal('Yey!');
    });
  });
  ///////////////////// END DOCS //////////////////////////

  describe('HashUtils', function() {
    const normalise = HashUtils.normalise;
    it('should be a function', function() {
      expect(normalise).to.be.a('function');
    });

    it('should accept an object', function() {
      expect(normalise({
        a: 1,
        b: {
          b1: 21,
          b2: 22
        },
        c: 3
      })).to.equal('a	1\nb1	21\nb2	22\nc	3\n');
    });
  });

  describe('LogLevel', function() {
    [ 'VERBOSE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL' ].forEach(level => {
      it('should have ' + level + ' as a level', function() {
        expect(LogLevel[level]).to.equal(level);
      });
    });

    it('should have #lessThan', function() {
      expect(LogLevel.lessThan).to.be.a('function');
    });
  });

  describe('Middleware', function() {
    describe('LogLevel enricher', function() {
      it('should filter', function() {
        const subject = Middleware.minLevel(LogLevel.INFO);
        const msg = Message.create({ template: 'test' });
        subject(msg)(msg => {
          expect(msg).to.be.null;
        });
      });
    });

    describe('messageId enricher', function() {
      var logary, logger, emptyHash;

      beforeEach('create new logary', function() {
        logary = new Logary('MyWebSite');
        logger = getLogger(logary, 'AreaX.ComponentA');
        const hasher = new jsSHA('SHA-256', 'TEXT');
        emptyHash = hasher.getHash('HEX');
      });

      const messageId = Middleware.messageId;

      it('should be a function', function() {
        expect(messageId).to.be.a('function');
      });

      it('should accept a message and return a function', function() {
        const msg = Message.create({ template: 'test' });
        expect(messageId(msg)).to.be.a('function');
      });

      it('should compute a SHA256 HEX message id', function() {
        const msg = Message.create({ template: 'test' });
        const res = messageId(msg)(logger);
        //console.log(JSON.stringify(res.messageId));
        expect(res.messageId).to.be.a('string');
        expect(res.messageId).to.not.equal(emptyHash);
        expect(res.messageId).to.equal('3d0d53606d89acafc37cb5c4d354e75dc7bb0bb9f2ff68a02f550580d1949a7e');
      });
    });


    describe('environment', function() {
      it('has Promise.all', function() {
        expect(Promise.all).to.be.a('function');
      });

      it('has expect(Promise.all([ .. ])).to.eventually', function() {
        const a = Promise.resolve(1),
              b = Promise.resolve(2);

        return expect(Promise.all([ a, b ])).to.eventually.be.fulfilled;
      });

      it('has Promise.all([ .. ]).then', function() {
        const a = Promise.resolve(1),
              b = Promise.resolve(2);

        expect(Promise.all([ a, b ]).then).to.be.a('function');
      });
    });

    describe('stacktrace enricher', function() {
      const stacktrace = Middleware.stacktrace,
            error = new Error("Oh Noes!");

      var logary, logger, emptyHash;

      beforeEach('create new logary', function() {
        logary = new Logary('MyWebSite', null, []);
        logger = getLogger(logary, 'AreaX.ComponentA');
      });

      it('should be a function', function() {
        expect(stacktrace).to.be.a('function');
      });

      it('should accept a message and return a function', function() {
        const msg = Message.create({ template: 'test' });
        expect(stacktrace(msg)).to.be.a('function');
      });

      it('passes through messages without errors', function() {
        const msg = Message.event('Signup');
        const res = stacktrace(msg)(logger);
        expect(res.template).to.equal('Signup');
        expect(res.level).to.equal('INFO');
        expect(res.fields).to.deep.equal({});
        expect(res.context).to.deep.equal({
          logger: 'AreaX.ComponentA',
          service: 'MyWebSite'
        });
      });

      it('parses errors in generated errors', function(done) {
        const msg = Message.eventError('Uncomfortable Error', error);
        const subjectMsg = stacktrace(msg)(logger);

        expect(expect(subjectMsg).to.eventually.be.fulfilled.then(msg => {
          expect(msg.fields).to.be.an('object');
          expect(msg.fields.errors).to.have.lengthOf(1);
          expect(msg.fields.errors[0]).to.not.equal(error);
          expect(msg.fields.errors[0]).to.be.an('Array');
        })).to.notify(done);
      });

      it('should parse errors into stack traces', function(done) {
        const msg = Message.eventError('Uncomfortable Error', error, {
                myField: 'abc'
              }),
              actual = stacktrace(msg)(logger).then(x => x.fields);

        expect(expect(Promise.all([
          actual,
          StackTrace.fromError(error)
        ])).to.eventually.be.fulfilled.then(([actualFields, expectedError]) => {
          expect(actualFields.errors[0]).to.deep.equal(expectedError);
          expect(actualFields.myField).to.equal('abc');
        })).to.notify(done);
      });
    });
  });

  describe('onerror', function() {
    var logary, logger;

    beforeEach('create new logary', function() {
      logary = new Logary('MyWebSite', msg => Promise.resolve(msg));
      logger = build(logary, getLogger(logary, 'AreaX.ComponentA'));
    });

    it('should be a function', function() {
      expect(onerror).to.be.a('function');
    });

    it('can be called with logger', function() {
      expect(onerror(logger)).to.be.a('function');
    });

    const err = new Error('BAM!');
    const createMsg = () =>
      onerror(logger)("XYZ is undefined", "sample.js", 1, 1, err);

    it('can be called with logger + args : Promise', function() {
      const msg = createMsg();
      expect(msg).to.eventually.be.fulfilled;
    });

    it('sets template', function() {
      const template = createMsg().then(x => x.template);
      expect(template).to.eventually.equal('Window onerror');
    });

    it('sets level', function() {
      const level = createMsg().then(x => x.level);
      expect(level).to.eventually.equal(LogLevel.ERROR);
    });

    it('sets errors', function() {
      const errors = createMsg().then(x => x.fields.errors);
      expect(errors).to.eventually.have.lengthOf(1);
    });

    it('sets the stacktrace', function(done) {
      const composed = compose(logger, Middleware.stacktrace);
      const futureMsg =
        onerror(composed)("XYZ is undefined", "sample.js", 1, 1, err);

      expect(expect(futureMsg).to.eventually.be.fulfilled.then(msg => {
        expect(msg.fields.errors[0]).to.not.equal(err);
        expect(msg.fields.errors[0]).to.be.an('Array');
      })).to.notify(done);
    });
  });

  describe('Targets', function() {
    describe('logaryService', function() {
      var logary, logger, conf, service;

      beforeEach('create new logary', function() {
        logary = new Logary('MyWebSite');
        logger = getLogger(logary, 'AreaX.ComponentA');
        conf = {
          path: '/i/site/logary',
          serialise: LogaryM.createContent,
          // in this test we stub the xmlHttpRequest
          send: req => Promise.resolve(req)
        };
        service = logaryService(conf);
      });

      it('should be a function', function() {
        expect(service).to.be.a('function');
      });

      it('should accept a message and return a function', function() {
        const msg = Message.create({ template: 'test' });
        expect(service(msg)).to.be.a('Promise');
      });

      it('returns a proper request', function(done) {
        const msg = Message.event('Signed Up');
        expect(expect(service(msg)).to.eventually.be.fulfilled.then(req => {
          expect(req).to.be.deep.equal({
            "batchable": true,
            "content": {
              "contentEncoding": "identity",
              "contentType": "application/json; charset=utf-8",
              "data": "{\"template\":\"Signed Up\",\"fields\":{},\"context\":{},\"level\":\"INFO\"}"
            },
            "headers": [
              {
                "name": "Accept",
                "values": [
                  "application/json"
                ]
              }
            ],
            "method": "POST",
            "uri": "/i/site/logary"
          });
        })).to.notify(done);
      });
    });
  });

  describe('Compression', function() {
    describe('LZW aka. "compress"', function() {
      it('exists', function() {
        expect(LZW.compress).to.be.a('function');
        expect(LZW.decompress).to.be.a('function');
      });

      it('supports roundtrip', function() {
        const input = "https://qvitoo.com"
        const output = LZW.compress(input);
        expect(LZW.decompress(output)).to.equal(input);
      });

      it('can be chained with JSON.stringify', function() {
        const testObj = { a: 3 };
        const f: ((o: Object) => string) = input =>
          LZW.compress(JSON.stringify(input));
        const fx = f(testObj);
        expect(fx).to.be.an('Array');
        expect(fx[0]).to.be.a('number');
      });
    });

    describe('prepareForHttp', function() {
      it('works on arrays of numbers', function() {
        const {
          contentType,
          contentEncoding,
          data
        } = Compression.prepareForHttp([ 12, 13, 14 ]);
        expect(contentType).to.equal('application/octet-stream');
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
        expect(contentEncoding).to.equal('compress');
        expect(data).to.be.a('uint8array');
      });

      it('works on byte (uint8) arrays', function() {
        const bytes = Uint8Array.from([ 1, 2, 3 ]); // not Array.isArray
        const {
          contentType,
          contentEncoding,
          data
        } = Compression.prepareForHttp(bytes);
        expect(data).to.equal(bytes);
        expect(contentEncoding).to.equal('compress');
        expect(contentType).to.equal('application/octet-stream');
      });

      it('works on strings', function() {
        const {
          contentType,
          contentEncoding,
          data
        } = Compression.prepareForHttp(JSON.stringify({ a: 1 }));
        const serialised = '{"a":1}';
        expect(data).to.equal(serialised);
        expect(contentEncoding).to.equal('identity');
        expect(contentType).to.equal('application/json; charset=utf-8');
      });
    });
  });
});
