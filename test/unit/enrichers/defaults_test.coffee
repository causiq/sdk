expect = require("chai").expect
sinon = require("sinon")

enricher = require("../../../src/enrichers/context")

describe 'calling', ->
  it 'adds #language', ->
    expect(enricher({})).language.to.equal('js')
