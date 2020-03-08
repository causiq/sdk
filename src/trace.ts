import { Attributes, SpanContext, Status, SpanKind } from '@opentelemetry/api'
import { Message, Timestamp } from './message'
import { Logger } from './logger'

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
