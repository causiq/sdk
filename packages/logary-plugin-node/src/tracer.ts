import Logary, { TracerModule, HasTracer, LogaryExporter } from "logary"
import { SimpleSpanProcessor } from "@opentelemetry/tracing"
import { NodeTracerProvider } from '@opentelemetry/node'

export default function create(logary: Logary): TracerModule & HasTracer {
  if (logary == null) throw new Error('Parameter "logary" is null or undefined; you need to pass in the Logary instance to the create function.')

  const provider = new NodeTracerProvider()
  provider.addSpanProcessor(new SimpleSpanProcessor(new LogaryExporter(logary)))
  provider.register()

  const name = logary.serviceName.join('.')
  const tracer = provider.getTracer(name, logary.serviceVersion)

  return { provider, tracer }
}