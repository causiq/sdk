import { Attributes, Status, SpanKind, Span as OTSpan, TimeInput, SpanContext, TracerProvider } from '@opentelemetry/api'
import { EventMessage } from '../message'
import { EpochNanoSeconds } from "../utils/time"
import { Tracer } from "@opentelemetry/api"

export { default as LogaryExporter } from './LogaryExporter'

/**
 * Via:
 * src/Logary/DataModel.Trace.fs
 * 
 * consider: @opentelemetry/tracing/ReadableSpan
 */
export interface SpanData {
  readonly spanContext: SpanContext;
  readonly events: EventMessage[];
  readonly attrs: Attributes;
  readonly status: Status;
  readonly kind: SpanKind;
  readonly label: string;
  readonly started: EpochNanoSeconds;
  readonly finished: EpochNanoSeconds;
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

export interface TracerModule {
  readonly provider: TracerProvider;
}

export interface HasTracer {
  readonly tracer: Tracer;
}