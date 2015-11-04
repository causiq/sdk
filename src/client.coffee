require './internal/compat'
merge = require './internal/merge'
State = require './internal/state'
{ Tracker } = require './users'

class Client
  constructor: (config) ->
    defaultConfig =
      # reporter opts
      ropts:
        # optional host (otherwise sends to path at current domain)
        host:      null
        # optional query string
        query:     null
        # optional uri path
        path:      null
        # optional uri port
        port:      null
      # optional
      # err -> name * {type,message,backtrace:Object list}
      processor: require('./processors/stack')
      # (Message -> Message) list
      enrichers: [ require('./enrichers/context') ]
      reporters: [ require('./reporters/logary'),
                   require('./reporters/console')
                 ]
      filters:   []
      context:   {}
      data:      {}
      session:   Tracker.read()

    @config = merge(State.config, defaultConfig, config)

    State.client ?= this # ugh

  _send: (message) ->
    [name, errInfo] = @config.processor message.error or message

    message = merge message,
      logger:
        name: 'logary-' + name
        version: '@@VERSION@@'
        url: 'https://github.com/logary/logary-js'
      errors: [ errInfo ]
      context: merge({}, @config.context, message.context)
      data: merge({}, @config.data, message.data)
      session: merge({}, @config.session, message.session)

    message = @config.enrichers.reduce ((msg, f) -> f msg), message

    for filterFn in @config.filters
      if not filterFn(message)
        return

    for reporterFn in @config.reporters
      reporterFn message, @config.ropts

    message

  event: (name, data) ->
    msg = merge data,
      type: 'event'
      data:
        eventName: name
    _send msg

  identify: (principalId) ->
    tracking = Tracker.read()
    Tracker.write 'principalId', principalId
    data = merge tracking, principalId: principalId
    event 'identify', data

  push: (err) -> @_send err

  logger: (defaults) ->
    new Client(merge(@config, defaults))

  _wrapArguments: (args) ->
    for arg, i in args
      if typeof arg == 'function'
        args[i] = @wrap arg
    args

  wrap: (fn) ->
    if fn.__logary__
      return fn

    self = this

    errorWrapper = ->
      args = self._wrapArguments(arguments)
      try
        return fn.apply(this, args)
      catch exc
        args = Array.prototype.slice.call(arguments)
        self.push
          error: exc
          data:
            arguments: args
        return null

    for prop of fn
      if fn.hasOwnProperty(prop)
        errorWrapper[prop] = fn[prop]

    errorWrapper.__logary__ = true
    errorWrapper.__inner__ = fn

    return errorWrapper

module.exports = Client
