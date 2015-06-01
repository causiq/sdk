expect = require("chai").expect
sinon = require("sinon")

reporter = require("../../../src/reporters/logary")

MockXhr = ->
MockXhr.prototype = {
  open: ->
  send: ->
  setRequestHeader: ->
}

describe "XhrReporter", ->
  oldXhr = null
  beforeEach ->
    oldXhr = global.XMLHttpRequest
    global.XMLHttpRequest = MockXhr
  afterEach ->
    global.XMLHttpRequest = oldXhr

  describe "report", ->
    it "opens async POST to url", ->
      spy = sinon.spy(global.XMLHttpRequest.prototype, 'open')
      reporter({}, {projectId: '[project_id]', projectKey: '[project_key]', host: 'https://example.com'})
      expect(spy).to.have.been.calledWith("POST", "https://example.com/i/logary/loglines", true)
      global.XMLHttpRequest.prototype.open.restore()

    it "opens POST to custom url", ->
      spy = sinon.spy(global.XMLHttpRequest.prototype, 'open')
      reporter({})
      expect(spy).to.have.been.calledWith("POST", "/i/logary/loglines", true)
      global.XMLHttpRequest.prototype.open.restore()
