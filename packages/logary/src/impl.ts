import LogaryPlugin, { PluginAPI } from "./plugin"
import RuntimeInfo from './runtimeInfo'
import { ensureName, ensureMessageId, adaptLogFunction } from './utils'
import { Config } from './config'
import { EventFunction, SetUserPropertyFunction, IdentifyUserFunction, ForgetUserFunction } from './types'
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

      log(level: LogLevel, ...messages: Message[]) {
        if (level < logary.minLevel) return
        if (messages == null || messages.length === 0) return

        const eN = ensureName(this.name)
        const parentSpanId = this.getCurrentSpan()?.context().spanId

        function ensureSpanId<T extends Message>(m: T) {
          return m.type === 'event' && parentSpanId != null ? {...m, parentSpanId } : m
        }

        function ensureUserId<T extends Message>(m: T): T {
          if (typeof window === 'undefined') return m
          if (typeof m.context['userId'] !== 'undefined') return m
          return { ...m, context: { ...m.context, userId: getUserId() } }
        }

        for (const message of messages.map(m => ensureMessageId(ensureUserId(ensureSpanId(eN(m)))))) {
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

  get debug() {
    return this.config.debug
  }
}
