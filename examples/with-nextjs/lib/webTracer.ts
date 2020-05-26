import { ZoneContextManager } from '@opentelemetry/context-zone'
import { B3Propagator } from '@opentelemetry/core'
import { CollectorExporter } from '@opentelemetry/exporter-collector'
import { DocumentLoad } from '@opentelemetry/plugin-document-load'
import { UserInteractionPlugin } from '@opentelemetry/plugin-user-interaction'
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing'
import { WebTracerProvider } from '@opentelemetry/web'

export const provider = new WebTracerProvider({
  // logger,
  plugins: [
    new DocumentLoad(),
    new UserInteractionPlugin(),
    new XMLHttpRequestPlugin({
      propagateTraceHeaderCorsUrls: [
        'https://httpbin.org/get',
      ],
    })
  ]
})


provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
provider.addSpanProcessor(new SimpleSpanProcessor(new CollectorExporter({
  url: `${window.location.origin}/i/trace`
})))

provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator()
})

const tracer = provider.getTracer('with-nextjs')

export default tracer