import Logary, { TracerModule, HasTracer, LogaryExporter } from "logary"
import { SimpleSpanProcessor } from "@opentelemetry/tracing"
import { WebTracerProvider } from '@opentelemetry/web'
// import { DocumentLoad } from '@opentelemetry/plugin-document-load'
// new DocumentLoad()

export default function create(logary: Logary): TracerModule & HasTracer {
  if (logary == null) throw new Error('Parameter "logary" is null or undefined; you need to pass in the Logary instance to the create function.')

  const provider = new WebTracerProvider({
    logger: logary.getLogger('Logary', 'webTracer'),
    plugins: [],
  })

  // delegate into Logary
  provider.addSpanProcessor(new SimpleSpanProcessor(new LogaryExporter(logary)))
  provider.register()

  const name = logary.serviceName.join('.')
  const tracer = provider.getTracer(name, logary.serviceVersion)
  return { provider, tracer }
}