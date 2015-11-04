merge = require './internal/merge'
kvs = require './internal/kvs'

# Util class
class Identity
  @autogen: ->
    d = new Date().getTime()
    'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) ->
      r = (d * Math.random() * 16) % 16 | 0
      d = Math.floor(d/16)
      if c == 'x' then r else (r&0x3|0x8)).toString(16)

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
