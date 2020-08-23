import { Attributes, Status, SpanKind, Span as OTSpan, TimeInput } from '@opentelemetry/api'
import { EventMessage, UnixEpochMillis } from './message'
import { Logger } from './logger'

/**
 * Via:
 * src/Logary/DataModel.Trace.fs
 */
export interface SpanData {
  readonly events: EventMessage[];
  readonly attrs: Attributes;
  readonly status: Status;
  readonly kind: SpanKind;
  readonly label: string;
  readonly started: UnixEpochMillis;
  readonly finished: UnixEpochMillis;
}

export interface SpanOps extends OTSpan {
  setLabel(label: string): this;
  clearFlags(): this;
  setDebugFlag(): this;
  setSampledFlag(): this;

  /**
   * End the Span
   * @param endTime Optional end time
   */
  end(endTime?: TimeInput): void;

  // also see:
  // isRecording(): boolean;
  // updateName(name: string): this;
  // addEvent(name: string, attributesOrStartTime?: Record<string, unknown> | TimeInput, startTime?: TimeInput): this;
  // setAttributes(attributes: Record<string, unknown>): this;
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