merge = require('../../internal/merge')

module.exports = (msg) ->
  merge msg,
    context:
      language: 'js'
      userAgent: global.navigator?.userAgent || 'unknown'
      url: String global.location
