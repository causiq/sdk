require('./internal/compat')
merge = require('./internal/merge')
# config -> reporterOpts

class Client
  constructor: (config) ->
    defaultConfig =
      # optional host (otherwise sends to path at current domain)
      host:      ""
      # optional query string
      query:     ""
      # optional 
      # err -> (name * {type,message,backtrace:string list} -> unit) -> unit
      processor: require('./processors/stack')
      reporters: [ require('./reporters/logary'),
                   require('./reporters/console')
                 ]
      filters:   []
      context:   {}
      data:      {}
      session:   {}
    @config = merge({}, defaultConfig, config)

  _configFilter: (config) ->
    host:  config.host
    query: config.query

  push: (err) ->
    defContext =
      language: 'JavaScript'

    if global.navigator?.userAgent
      defContext.userAgent = global.navigator.userAgent
    if global.location
      defContext.url = String(global.location)

    @config.processor err.error or err, (name, errInfo) =>
      logline =
        logger:
          name: 'logary-' + name
          version: '@@VERSION@@'
          url: 'https://github.com/logary/logary-js'
        errors: [errInfo]
        context: merge(defContext, @config.context, err.context)
        data: merge({}, @config.data, err.data)
        session: merge({}, @config.session, err.session)

      for filterFn in @config.filters
        if not filterFn(logline)
          return

      for reporterFn in @config.reporters
        opts = @_configFilter @config
        reporterFn logline, opts

      return

  _wrapArguments: (args) ->
    for arg, i in args
      if typeof arg == 'function'
        args[i] = @wrap(arg)
    return args

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
        self.push({error: exc, data: {arguments: args}})
        return null

    for prop of fn
      if fn.hasOwnProperty(prop)
        errorWrapper[prop] = fn[prop]

    errorWrapper.__logary__ = true
    errorWrapper.__inner__ = fn

    return errorWrapper

module.exports = Client
