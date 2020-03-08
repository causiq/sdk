import { Config } from './config'
import RuntimeInfo from './runtimeInfo'
import { Subject, Subscription, empty } from 'rxjs'
import { Message, LogLevel } from './message'
import { Logger } from './logger'
import { adaptLogFunction } from './util'
import { hexDigest } from './hasher'

type LogaryState = | 'initial' | 'started' | 'closed'

function ensureName(name: string[]) {
  return (m: Message) => m.name == null || m.name.length === 0 ? { ...m, name } : m
}

function ensureMessageId(m: Message): Message {
  if (m.id != null) return m
  return { ...m, id: hexDigest(m) }
}

/**
 * 1. Pass a config to the c'tor
 * 2. Call `start(): Subscription`
 * 3. Log stuff
 * 4. Dispose the subscription you received in the `start()` return value.
 */
export default class Logary implements RuntimeInfo {
  constructor(private config: Config) {
    if (Array.isArray(config.serviceName) && config.serviceName.length === 0) {
      throw new Error("config.serviceName must be non-empty array, if it gets passed an array")
    }
  }

  _state: LogaryState = 'initial'
  _messages: Subject<Message[]> = new Subject<Message[]>()
  _subscription = new Subscription(this.unsubscribe.bind(this))

  start(): Subscription {
    if (this._state !== 'initial') throw new Error("Logary started twice")
    this._state = 'started'

    for (let t of this.config.targets) {
      this._subscription.add(t.run(this.config, this))
    }

    return this._subscription
  }

  private unsubscribe() {
    if (this._state === 'initial') throw new Error("Logary not started yet")
    this._state = 'closed'
  }

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
        this.log(level, adaptLogFunction(level, message, args))
      }

      // LoggerEx:
      verbose = this._loggerEx.bind(this, LogLevel.verbose)
      debug = this._loggerEx.bind(this, LogLevel.debug)
      info = this._loggerEx.bind(this, LogLevel.info)
      warn = this._loggerEx.bind(this, LogLevel.warn)
      error = this._loggerEx.bind(this, LogLevel.error)
      fatal = this._loggerEx.bind(this, LogLevel.fatal)
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

  get targets() {
    return this.config.targets
  }

  get minLevel() {
    return this.config.minLevel
  }
}
