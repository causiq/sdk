State = require './internal/state'

module.exports = (defaults, client) ->
  client = client || State.client
  client.logger defaults
