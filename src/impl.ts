import { empty, Subject, Subscription } from 'rxjs'
import { Config } from './config'
import LogaryPlugin, { PluginAPI } from "./logaryPlugin"
import { Logger, EventFunction } from './logger'
import { LogLevel, Message } from './message'
import { Runnable } from "./runnable"
import RuntimeInfo from './runtimeInfo'
import { adaptLogFunction, ensureName, ensureMessageId } from './util'
import money from "./money"

type LogaryState = | 'initial' | 'started' | 'closed'

const noPlugins: LogaryPlugin[] = []

/**
 * 1. Pass a config to the c'tor
 * 2. Call `start(): Subscription`
 * 3. Log stuff
 * 4. Dispose the subscription you received in the `start()` return value.
 */
export default class Logary implements RuntimeInfo, PluginAPI {
  constructor(private config: Config) {
    if (Array.isArray(config.serviceName) && config.serviceName.length === 0) {
      throw new Error("config.serviceName must be non-empty array, if it gets passed an array")
    }
    this.start = this.start.bind(this) // stop is handled privately
    this.getLogger = this.getLogger.bind(this)
    this.getSupporters = this.getSupporters.bind(this)
    this.register = this.register.bind(this)
  }

  // internal state handling
  private _state: LogaryState = 'initial'

  // can use this as an event aggregator in your app
  private _messages: Subject<Message[]> = new Subject<Message[]>()

  // subscriptions are used keep track of what to dispose, and are correlated to _state
  private _subscription = new Subscription(this.stop.bind(this))
  private _runOnStart: Runnable[] = []

  // plugin API
  private _plugins: LogaryPlugin[] = []

  start(): Subscription {
    if (this._state !== 'initial') throw new Error("Logary started twice")
    if (this.config.debug) console.log('Logary starting, config=', this.config)

    this._state = 'started'

    for (const t of this.config.targets) {
      if (this.config.debug) console.log('Logary starting Target', t)
      this._subscription.add(t.run(this.config, this))
    }

    for (const r of this._runOnStart) {
      if (this.config.debug) console.log('Logary starting Runnable', r)
      this._subscription.add(r.run(this.config, this))
    }
    this._runOnStart = []

    return this._subscription
  }

  private stop() {
    if (this._state === 'initial') throw new Error("Logary not started yet")
    if (this.config.debug) console.log('Logary stopping')

    this._plugins = []
    this._state = 'closed'
  }

  // PluginAPI:
  register(plugin: LogaryPlugin) {
    if (this._state === 'closed') throw new Error("Logary is closed")
    if (this.config.debug) console.log('Logary registering Plugin', plugin)

    this._plugins.push(plugin)

    if (this._state === 'initial') this._runOnStart.push(plugin)
    else this._subscription.add(plugin.run(this.config, this))
  }

  getSupporters(features: string[]): LogaryPlugin[] {
    // TO CONSIDER: this can be optimised so that every time the list of plugins changes, we recompute a mapping
    // from Feature => LogaryPlugin[]
    let ret: LogaryPlugin[] | null = null
    for (const p of this._plugins) {
      for (const f of features) {
        if (p.supports(f)) {
          (ret = ret || []).push(p) // only allocate array if we find a match
          break // breaks innermost loop only
        }
      }
    }
    return ret || noPlugins
  }
  // end of PluginAPI

  // Logging API:
  getLogger(...scopeName: string[]): Logger {
    if (scopeName == null) throw new Error('scopeName was null or undefined')
    const logary = this

    return new class LoggerImpl implements Logger {
      name: string[] = [ ...logary.serviceName, ...scopeName ]

      log(level: LogLevel, ...messages: Message[]) {
        if (level < logary.minLevel) return
        if (messages == null || messages.length === 0) return
        const eN = ensureName(this.name)
        logary._messages.next(messages.map(m => ensureMessageId(eN(m))))
      }

      /**
       * private, leave me alone!
       */
      _loggerEx(level: LogLevel, message: string, ...args: unknown[]) {
        if (level < logary.minLevel) return
        this.log(level, adaptLogFunction(level, message, ...args))
      }

      // LoggerEx:
      verbose = this._loggerEx.bind(this, LogLevel.verbose)
      debug = this._loggerEx.bind(this, LogLevel.debug)
      info = this._loggerEx.bind(this, LogLevel.info)
      warn = this._loggerEx.bind(this, LogLevel.warn)
      error = this._loggerEx.bind(this, LogLevel.error)
      fatal = this._loggerEx.bind(this, LogLevel.fatal)

      /**
       * Log a new event
       * @param event The event name
       * @param moneyOrError A Money or Error instance or undefined
       * @param args Remaining args
       */
      event: EventFunction = (event, moneyOrError, ...args) => {
        const currency = typeof args[0] === 'string' ? args[0] : 'EUR'
        const nextArgs = moneyOrError == null
          ? args
          : moneyOrError instanceof Error
            ? [ { error: moneyOrError }, ...args ]
            : typeof moneyOrError === 'number'
              ? [ { monetaryValue: money(currency, moneyOrError) }, ...args ]
              : [ { monetaryValue: moneyOrError }, ...args ]
        this._loggerEx(LogLevel.info, event, ...nextArgs)
      }
    }
  }

  get messages() {
    if (this._state !== 'started') return empty()
    return this._messages.asObservable()
  }

  get serviceName() {
    return Array.isArray(this.config.serviceName)
      ? this.config.serviceName
      : [ this.config.serviceName ]
  }

  get serviceVersion() {
    return this.config.serviceVersion
  }

  get targets() {
    return this.config.targets
  }

  get minLevel() {
    return this.config.minLevel
  }
}
