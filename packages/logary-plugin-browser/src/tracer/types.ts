import { Tracer } from "@opentelemetry/tracing"
import { TracerProvider } from "@opentelemetry/api"

export interface TracerModule {
  readonly provider: TracerProvider;
}

export interface HasTracer {
  readonly tracer: Tracer;
}