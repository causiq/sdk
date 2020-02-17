import { Attributes, SpanContext, Status, SpanKind, Logger as OTLogger  } from '@opentelemetry/api'
import { LogLevel, Message, Timestamp } from './message'
import template from './formatting/template'
import ConsoleTarget from './targets/console'
import RuttaTarget from './targets/rutta'
import { Target } from './targets'
import { Logger } from './logger'
import { hexDigest } from './hasher'

export default class Logary implements Logger {
  constructor(
    public name: string,
    private targets: Target[],
    public minLevel: LogLevel = LogLevel.Verbose) {}

  log(level: LogLevel, message: Message): void {
    if (level < this.minLevel) return;

    const m = {
      ...message,
      id: hexDigest(message)
    }
    this.targets.forEach(target => {
      target.log([ m ])
    })
  }

  debug(value: string, ...args: unknown[]): void {
    this.log(LogLevel.Debug, createMessage(LogLevel.Debug, value, args))
  }

  info(value: string, ...args: unknown[]): void {
    this.log(LogLevel.Info, createMessage(LogLevel.Info, value, args))
  }

  warn(value: string, ...args: unknown[]): void {
    this.log(LogLevel.Warn, createMessage(LogLevel.Warn, value, args))
  }

  error(value: string, ...args: unknown[]): void {
    this.log(LogLevel.Error, createMessage(LogLevel.Error, value, args))
  }

  shutdown() {
    this.targets.forEach(t => t.shutdown())
  }
}

const emptyFields = {}

function createMessage(level: LogLevel, value: string, inputFields: unknown[]): Message {
  let fields: Record<string, any> = emptyFields

  if (inputFields.length !== 0 && typeof inputFields[0] !== 'undefined') {
    switch (typeof inputFields[0]) {
      case 'object':
        fields = { ...fields, ...inputFields[0] }
        break
      default:
        break;
    }
  }

  return {
    value,
    fields,
    timestamp: Date.now(),
    level,
    templated: template(value, fields)
  }
}

export let logger: OTLogger = new Logary("console",  [new ConsoleTarget(true), new RuttaTarget()]) // Remember to unsubscribe

export function debug(value: string, fields?: Record<string, any>) {
  return logger.debug(value, fields)
}

export function info(value: string, fields?: Record<string, any>) {
  return logger.info(value, fields)
}

export function error(value: string, fields?: Record<string, any>) {
  return logger.error(value, fields)
}


// export function startSpan(label: string, spanOptions: SpanOptions = {}): SpanLogger {
//   return logger.startSpan(label, spanOptions)
// }

/**
 * Via:
 * src/Logary/DataModel.Trace.fs
 */
export interface SpanData {
  context: SpanContext;

  events: Message[];
  attrs: Attributes;
  status: Status;
  kind: SpanKind;
  label: string;
  isDebug: boolean;
  isSampled: boolean;

  started: Timestamp;
  finished: Timestamp;
  isRecording: boolean;
}

export interface SpanOps {
  setAttribute(key: string, value: number | boolean | string): void;
  setStatus(status: Status): void;
  setLabel(label: string): void;
  clearFlags(): void;
  setDebugFlag(): void;
  setSampledFlag(): void;
  finish(): void;
}

export interface Span extends SpanData, SpanOps {}

/**
 * A SpanLogger is alike a Logger, but is backed with a running Span.
 *
 * From https://open-telemetry.github.io/opentelemetry-js/interfaces/tracer.html#bind
 */
export interface SpanLogger extends Span, Logger {
  logThrough(): void;
}