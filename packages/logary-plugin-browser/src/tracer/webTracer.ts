import { TracerModule } from "logary"
import { SpanExporter, SimpleSpanProcessor } from "@opentelemetry/tracing"
import { DocumentLoad } from '@opentelemetry/plugin-document-load'
import { WebTracerProvider } from '@opentelemetry/web'
import Logary from "logary"

export default function create(delegator: SpanExporter, logary: Logary): TracerModule {
  const provider = new WebTracerProvider({
    logger: logary.getLogger('Logary', 'webTracer'),
    plugins: [
      new DocumentLoad()
    ],
  })

  // delegate into Logary
  provider.addSpanProcessor(new SimpleSpanProcessor(delegator))
  provider.register()

  return { provider }
}