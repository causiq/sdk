chai = require("chai")
sinon = require("sinon")
sinon_chai = require("sinon-chai")
merge = require('../../src/internal/merge')
expect = chai.expect
chai.use(sinon_chai)

Client = require("../../src/client")

testWrap = (client) ->
  describe "wrap", ->
    it "does not invoke function immediately", ->
      fn = sinon.spy()
      client.wrap(fn)
      expect(fn).not.to.have.been.called

    it "creates wrapper that invokes function with passed args", ->
      fn = sinon.spy()
      wrapper = client.wrap(fn)
      wrapper("hello", "world")
      expect(fn).to.have.been.called
      expect(fn.lastCall.args).to.deep.equal(["hello", "world"])

    it "sets __logary__ and __inner__ properties", ->
      fn = sinon.spy()
      wrapper = client.wrap(fn)
      expect(wrapper.__logary__).to.equal(true)
      expect(wrapper.__inner__).to.equal(fn)

    it "copies function properties", ->
      fn = sinon.spy()
      fn.prop = "hello"
      wrapper = client.wrap(fn)
      expect(wrapper.prop).to.equal("hello")

    it "reports throwed exception", ->
      client.push = sinon.spy()
      exc = new Error("test")
      fn = ->
        throw exc
      wrapper = client.wrap(fn)
      wrapper("hello", "world")
      expect(client.push).to.have.been.called
      expect(client.push.lastCall.args).to.deep.equal([{error: exc, data: {arguments: ["hello", "world"]}}])

    it "wraps arguments", ->
      fn = sinon.spy()
      wrapper = client.wrap(fn)
      arg1 = ->
      wrapper(arg1)
      expect(fn).to.have.been.called
      arg1Wrapper = fn.lastCall.args[0]
      expect(arg1Wrapper.__logary__).to.equal(true)
      expect(arg1Wrapper.__inner__).to.equal(arg1)


describe "Client", ->
  clock = undefined

  beforeEach ->
    clock = sinon.useFakeTimers()

  afterEach ->
    clock.restore()

  processor  = null
  reporter   = null
  makeClient = null

  beforeEach ->
    processor = sinon.spy (data, cb) ->
      cb data
    reporter = sinon.spy()
    makeClient = (f, p = processor, r = reporter, rest = {}) ->
      config =
        processor: p
        reporters: [r]
        filters: if f? then [f] else []
      new Client(merge({}, config, rest))

  describe 'filters', ->
    describe 'addFilter', ->
      it 'can prevent report', ->
        filter = sinon.spy((logline) -> false)
        client = makeClient filter
        client.push {}
        continueFromProcessor = processor.lastCall.args[1]
        continueFromProcessor('test', {})

        expect(reporter).not.to.have.been.called
        expect(filter).to.have.been.called

      it 'can allow report', ->
        filter = sinon.spy((logline) -> true)
        client = makeClient filter

        client.push {}
        continueFromProcessor = processor.lastCall.args[1]
        continueFromProcessor('test', {})

        expect(reporter).to.have.been.called
        logline = reporter.lastCall.args[0]
        expect(filter).to.have.been.calledWith(logline)

  describe "push", ->
    exception = do ->
      error = undefined
      try
        (0)()
      catch _err
        error = _err
      return error

    describe "with error", ->
      it "processor is called", ->
        makeClient().push exception
        expect(processor).to.have.been.called

      it "reporter is called with valid options", ->
        client = makeClient()
        client.push exception

        expect(reporter).to.have.been.called
        opts = reporter.lastCall.args[1]
        expect(opts).to.deep.equal
          host: ""
          query: ""

      it "reporter is called with custom host", ->
        client = makeClient null, null, null,
          host: "https://custom.domain.com"
        client.push exception

        reported = reporter.lastCall.args[1]
        expect(reported.host).to.equal("https://custom.domain.com")

    describe "custom data sent to reporter", ->
      it "reports context", ->
        client = makeClient null, null, null,
          context:
            context_key: "[custom_context]"
        client.push exception

        reported = reporter.lastCall.args[0]
        expect(reported.context.context_key).to.equal("[custom_context]")

      it "reports data", ->
        client = makeClient null, null, null,
          data:
            params_key: "[custom_params]"
        client.push exception

        reported = reporter.lastCall.args[0]
        expect(reported.data.params_key).to.equal("[custom_params]")

      it "reports session", ->
        client = makeClient null, null, null,
          session:
            principalId: "[custom_session]"
        client.push exception

        reported = reporter.lastCall.args[0]
        expect(reported.session.principalId).to.equal("[custom_session]")

      describe "wrapped error", ->
        it "unwraps and processes error", ->
          client = makeClient()
          client.push(error: exception)
          expect(processor).to.have.been.calledWith exception

        it "reports custom context", ->
          client = makeClient null, null, null,
            context:
              context1: 'value1'
              context2: 'value2'

          client.push
            error: exception
            context:
              context1: "push_value1"
              context3: "push_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.context).to.deep.equal
            language: "JavaScript"
            context1: "push_value1"
            context2: "value2"
            context3: "push_value3"

        it "reports custom data", ->
          client = makeClient null, null, null,
            data:
              param1: 'value1'
              param2: 'value2'
          client.push
            error: exception
            data:
              param1: "push_value1"
              param3: "push_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.data).to.deep.equal
            param1: "push_value1"
            param2: "value2"
            param3: "push_value3"

        it "reports custom session", ->
          client = makeClient null, null, null,
            session:
              session1: 'value1'
              session2: 'value2'
          client.push
            error: exception
            session:
              session1: "push_value1"
              session3: "push_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.session).to.deep.equal
            session1: "push_value1"
            session2: "value2"
            session3: "push_value3"

  describe "custom reporter", ->
    it "is called on error", ->
      customReporter = sinon.spy()
      client = makeClient null, null, customReporter
      client.push error: {}
      expect(customReporter).to.have.been.called

  testWrap(new Client(processor: null, reporter: null))
