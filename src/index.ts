import { Attributes, SpanContext, Status, SpanKind } from '@opentelemetry/api'
import { LogLevel, Message, Timestamp } from './message';

/**
 * Base interface for Logging in Logary
 */
export interface Logger {
  name: string;
  log(level: LogLevel, message: Message): void;
}

export interface LoggerEx {
  debug(value: string, fields?: Record<string, any>): void;
  info(value: string, fields?: Record<string, any>): void;
  error(value: string, fields?: Record<string, any>): void;
}

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


export interface Span extends SpanData, SpanOps {
}

/**
 * A SpanLogger is alike a Logger, but is backed with a running Span.
 *
 * From https://open-telemetry.github.io/opentelemetry-js/interfaces/tracer.html#bind
 */
export interface SpanLogger extends Span, Logger, LoggerEx {
  logThrough(): void;
}