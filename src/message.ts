import template, { Templated } from './formatting/template'
import { hexDigest } from './hasher'
import { Money } from "./money"
import { SpanContext, Status, CanonicalCode, SpanKind } from "@opentelemetry/api"
import { SpanData } from "./trace"

export enum LogLevel {
  verbose = 1,
  debug = 2,
  info = 3,
  warn = 4,
  error = 5,
  fatal = 6
}

export type UnixEpochMillis = number;

export interface LogaryMessage {
  readonly id: string;
  readonly name: string[];
  readonly level: LogLevel;
  readonly timestamp: UnixEpochMillis;
  readonly fields?: Record<string, unknown>;
}

export class EventMessage implements LogaryMessage {
  constructor(
    public event: string,
    public monetaryValue: Money | null = null,
    public error: Error | null = null,
    public level: LogLevel = LogLevel.info,
    public fields: Record<string, unknown> = {},
    public context: Record<string, unknown> = {},
    public name: string[] = [],
    public timestamp: UnixEpochMillis = Date.now())
  {

    this.templated = template(event, { ...fields, ...context })
    this.id = hexDigest(this)
  }

  templated: Templated
  id: string
  type: 'event' = 'event'
}

export class SpanMessage implements LogaryMessage, SpanData {
  constructor(
    public context: SpanContext,
    public label: string,
    public level: LogLevel = LogLevel.info,
    public kind: SpanKind = SpanKind.CLIENT,
    public status: Status = { code: CanonicalCode.OK },
    public events: EventMessage[] = [],
    public attrs: Record<string, unknown> = {},
    public started: UnixEpochMillis = Date.now(),
    finished?: UnixEpochMillis)
  {
    this.finished = finished || started + 1
    this.id = hexDigest(this)
  }

  id: string
  finished: UnixEpochMillis
  type: 'span' = 'span'

  get name() { return [ this.label ] }
  get timestamp() { return this.started }
  get fields() { return this.attrs }
}

export type Message = SpanMessage | EventMessage