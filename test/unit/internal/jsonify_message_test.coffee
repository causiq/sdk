expect = require('chai').expect
sinon = require('sinon')

jsonifyLogline = require('../../../src/internal/jsonify_message')


describe 'jsonify_logline', ->
  context 'when called with logline', ->
    obj =
      params: {arguments: []}
      environment: {env1: 'value1'}
      session: {session1: 'value1'}
    json = null

    beforeEach ->
      json = jsonifyLogline(obj)

    it 'produces valid JSON', ->
      expect(JSON.parse(json)).to.deep.equal(obj)

  context 'when called with huge logline', ->
    obj = null
    json = null
    maxLength = 30000

    beforeEach ->
      obj =
        data:
          arr: []

      for i in [0..1000]
        obj.data.arr.push(Array(100).join('x'))

      json = jsonifyLogline(obj, 1000, maxLength)

    it 'limits json size', ->
      expect(json.length).to.be.below(maxLength)

  context 'when called with one huge string', ->
    json = null
    maxLength = 30000

    beforeEach ->
      obj = {
        data: {str: Array(100000).join('x')},
      }
      json = jsonifyLogline(obj, 1000, maxLength)

    it 'limits json size', ->
      expect(json.length).to.be.below(maxLength)

  context 'when called with huge error message', ->
    fn = null
    maxLength = 30000

    beforeEach ->
      obj =
        errors: [{
          message: Array(100000).join('x')
        }]

      fn = ->
        jsonifyLogline(obj, 1000, maxLength)

    it 'throws an exception', ->
      expect(fn).to.throw('logary-js: cannot jsonify logline (length=100049 maxLength=30000)')

    it 'throws an exception with `json` property', ->
      try
        fn()
      catch err
        expect(err.data.json).to.be.defined
