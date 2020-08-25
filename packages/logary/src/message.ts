import template, { Templated } from './formatting/template'
import { hexDigest } from './utils/hasher'
import { Money } from "./money"
import { SpanContext, Status, CanonicalCode, SpanKind, TimedEvent, HrTime } from "@opentelemetry/api"
import { SpanData } from "./trace"
import getTimestamp, { EpochNanoSeconds, hrTimeToEpochNanoSeconds } from "./utils/time"
import { ReadableSpan } from "@opentelemetry/tracing"
import { ErrorInfo, SetUserPropertyFunction } from "./types"

export enum LogLevel {
  verbose = 1,
  debug = 2,
  info = 3,
  warn = 4,
  error = 5,
  fatal = 6
}

export interface LogaryMessage {
  readonly id: string;
  readonly name: string[];
  readonly level: LogLevel;
  readonly timestamp: EpochNanoSeconds;
  readonly fields?: Record<string, unknown>;
}

export class EventMessage implements LogaryMessage {
  constructor(
    public event: string,
    public monetaryValue: Money | null = null,
    public error: Error | ErrorInfo | null = null,
    public level: LogLevel = LogLevel.info,
    public timestamp: EpochNanoSeconds = getTimestamp(),
    public fields: Record<string, unknown> = {},
    public context: Record<string, unknown> = {},
    public name: string[] = [])
  {
    const vars = { ...fields, ...context }
    this.templated = template(event, vars)
    this.id = hexDigest(this)
  }

  templated: Templated
  id: string
  type: 'event' = 'event'

  static ofTimedEvent(te: TimedEvent): EventMessage {
    const timestamp = hrTimeToEpochNanoSeconds(te.time)
    return new EventMessage(te.name, null, null, LogLevel.info, timestamp)
  }
}

export class SpanMessage implements LogaryMessage, SpanData {
  constructor(
    public spanContext: SpanContext,
    public label: string,
    public level: LogLevel = LogLevel.info,
    public kind: SpanKind = SpanKind.CLIENT,
    public status: Status = { code: CanonicalCode.OK },
    public events: EventMessage[] = [],
    public attrs: Record<string, unknown> = {},
    public context: Record<string, unknown> = {},
    public started: EpochNanoSeconds = getTimestamp(),
    finished?: EpochNanoSeconds)
  {
    this.finished = finished || started + BigInt(1)
    this.id = hexDigest(this)
  }

  id: string
  finished: EpochNanoSeconds
  type: 'span' = 'span'

  get name() { return [ this.label ] }
  get timestamp() { return this.started }
  get fields() { return this.attrs }

  static ofReadableSpan(rs: ReadableSpan): SpanMessage {
    const level = rs.attributes['error'] === true ? LogLevel.error : LogLevel.info
    return new SpanMessage(
      rs.spanContext,
      rs.name,
      level,
      rs.kind,
      rs.status,
      rs.events.map(EventMessage.ofTimedEvent),
      rs.attributes,
      {},
      hrTimeToEpochNanoSeconds(rs.startTime),
      hrTimeToEpochNanoSeconds(rs.endTime)
    )
  }
}

export class SetUserPropertyMessage implements LogaryMessage {
  constructor(
    public userId: string,
    public key: string,
    public value: unknown,
    public name: string[],
    public timestamp: EpochNanoSeconds = getTimestamp(),
    id?: string
  ) {
    this.level = LogLevel.info
    this.fields = {}
    this.id = id || hexDigest(this)
  }
  id: string
  level: LogLevel
  fields: Record<string, unknown>
  type: 'setUserProperty' = 'setUserProperty'
}

export type Message = SpanMessage | EventMessage | SetUserPropertyMessage