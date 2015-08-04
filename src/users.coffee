merge = require './internal/merge'
kvs = require './internal/kvs'

# Util class
class Identity
  @autogen: ->
    'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) ->
      r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8)
      v.toString 16

# Used by Client to restore tracking state
class Tracker
  # Returns the #session object for the client
  @read: ->
    kvs.getOrSet 't',
      # Need to save tracking cookie
      userId: Identity.autogen()

  @write: (key, value) ->
    kvs.write 't', (map) ->
      o = {}
      o[key] = value
      merge(map, o)

# Module for user-oriented functions
class Users
  @getUniqueId: (session) ->
    session.principalId || session.userId

module.exports = Users
module.exports.Identity = Identity
module.exports.Tracker = Tracker
