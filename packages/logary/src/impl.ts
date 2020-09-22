import LogaryPlugin, { PluginAPI } from "./plugin"
import RuntimeInfo from './runtimeInfo'
import { ensureMessageId, adaptLogFunction } from './utils'
import { Config } from './config'
import { EventFunction, SetUserPropertyFunction, IdentifyUserFunction, ForgetUserFunction, ValueOf } from './types'
import { ForgetUserMessage, LogLevel, Message, SetUserPropertyMessage } from './message'
import { Logger } from './logger'
import { Runnable } from "./types"
import { empty, Subject, Subscription } from 'rxjs'
import createEventMessage from "./utils/createEventMessage"
import createIdentifyMessage from "./utils/createIdentifyMessage"
import getTimestamp from "./utils/time"
import { OpenTelemetryHasTracer } from "./features"
import { HasTracer } from "."
import { NoopTracer, Tracer, Span, SpanOptions, Context } from "@opentelemetry/api"
import getUserId from "./utils/getUserId"

type LogaryState = | 'initial' | 'started' | 'closed'

const noPlugins: LogaryPlugin[] = []

function ensureSpanId<T extends Message>(parentSpanId: null | undefined | string, m: T): T {
  return m.type === 'event' && parentSpanId != null ? {...m, parentSpanId } : m
}

function ensureUserId<T extends Message>(m: T): T {
  if (typeof window === 'undefined') return m
  if (m.context['userId'] != null) return m
  return { ...m, context: { ...m.context, userId: getUserId() } }
}

function ensureAppId<T extends Message>(appId: string | null | undefined, m: T): T {
  if (appId == null) return m
  if (m.context['appId'] != null) return m
  return { ...m, context: { ...m.context, appId } }
}

function ensureName<T extends Message>(name: string[], m: T): T {
  return m.name == null || m.name.length === 0 ? { ...m, name } : m
}

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
  private _messages: Subject<Message> = new Subject<Message>()

  // subscriptions are used keep track of what to dispose, and are correlated to _state
  private _subscription = new Subscription(this.stop.bind(this))
  private _runOnStart: Runnable[] = []

  // plugin API
  private _plugins: LogaryPlugin[] = []

  public i: [keyof Config, ValueOf<Config>][] = []

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

  getSupporters(...features: string[]): LogaryPlugin[] {
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

  getTracer(): Tracer {
    const hasTracer = this.getSupporters(OpenTelemetryHasTracer)

    // if (this.config.debug) {
    //   console.log(`Found ${hasTracer.length} plugins supporting OpenTelemetry and the HasTracer feature: `, hasTracer.map(p => p.name))
    // }

    return hasTracer.length === 0 ? new NoopTracer() : (hasTracer[0] as unknown as HasTracer).tracer
  }

  // Logging API:
  getLogger(...scopeName: string[]): Logger {
    if (scopeName == null) throw new Error('scopeName was null or undefined')
    const logary = this

    return new class LoggerImpl implements Logger {
      name: string[] = [ ...logary.serviceName, ...scopeName ]

      private ensureName<T extends Message>(m: T) {
        return ensureName(this.name, m)
      }

      log(level: LogLevel, ...messages: Message[]) {
        if (level < logary.minLevel) return
        if (messages == null || messages.length === 0) return

        const parentSpanId = this.getCurrentSpan()?.context().spanId

        for (const message of messages.map(m =>
          ensureAppId(
            logary.config.appId,
            ensureMessageId(
              ensureUserId(
                ensureSpanId(parentSpanId,
                  this.ensureName(m))))))) {
          logary._messages.next(message)
        }
      }

      /**
       * private, leave me alone!
       */
      private _loggerEx(level: LogLevel, message: string, ...args: unknown[]) {
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
       * Logs a new event
       */
      event: EventFunction = (...args: unknown[]) => {
        // @ts-ignore
        const m = createEventMessage(...args)
        this.log(LogLevel.info, m)
      }

      setUserProperty: SetUserPropertyFunction = (userId: string, key: string, value: unknown) => {
        const m = new SetUserPropertyMessage(userId, key, value, this.name, getTimestamp())
        this.log(LogLevel.info, m)
      }

      identify: IdentifyUserFunction = (...args: unknown[]) => {
        // @ts-ignore TO CONSIDER: passing along user id
        const m = createIdentifyMessage(null, ...args)
        this.log(LogLevel.info, m)
      }

      forgetUser: ForgetUserFunction = (...args: unknown[]) => {
        const uId = args[0] as string || getUserId()
        this.log(LogLevel.info, new ForgetUserMessage(uId))
      }

      // (opentelemetry/api).Tracer starts here
      getCurrentSpan() {
        return logary.getTracer().getCurrentSpan()
      }

      withSpan(span: Span, fn: any) {
        return logary.getTracer().withSpan(span, fn)
      }

      bind(target: any, context?: Span) {
        return logary.getTracer().bind(target, context)
      }

      startSpan(name: string, options?: SpanOptions, context?: Context) {
        return logary.getTracer().startSpan(name, options, context)
      }
      // (opentelemetry/api).Tracer ends here
    }
  }

  /**
   * Sets value on the configuration by overwriting the current configuration instance.
   */
  set(key: keyof Config, value: ValueOf<Config>) {
    if (key == null || value == null) return
    if (this.config.debug) console.log('(:Logary).set', key, value)
    this.config = { ...this.config, [key]: value }
  }

  /**
   * A way to reconfigure this Logary instance at runtime without cycling the
   * Subject carrying the current messages. Configuration applies to consecutively
   * logged messages.
   */
  reconfigure(): void {
    if (this.i == null || this.i.length == 0) return
    for (let k = 0; k < this.i.length; k++) {
      this.set(this.i[k][0], this.i[k][1])
    }
    this.i = []
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

  /**
   * Gets the lowest level of logs that Logary send to the backend.
   */
  get minLevel() {
    return this.config.minLevel
  }

  /**
   * Gets whether Logary is in debug mode.
   */
  get debug() {
    return this.config.debug
  }

  /**
   * Gets the configured application id for this app.
   */
  get appId() {
    return this.config.appId
  }

  /**
   * Gets the current Logary state: 'initial' | 'started' | 'closed'
   */
  get state() {
    return this._state
  }
}
