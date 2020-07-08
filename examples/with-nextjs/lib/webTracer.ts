import { ZoneContextManager } from '@opentelemetry/context-zone'
import { B3Propagator } from '@opentelemetry/core'
import { CollectorExporter } from '@opentelemetry/exporter-collector'
import { DocumentLoad } from '@opentelemetry/plugin-document-load'
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing'
import { WebTracerProvider } from '@opentelemetry/web'
import logary from './logary'

const logger = logary.getLogger()

export const provider = new WebTracerProvider({
  logger,
  defaultAttributes: {
    userId: "12345678",
  },
  plugins: [
    new DocumentLoad(),
    new XMLHttpRequestPlugin({
      propagateTraceHeaderCorsUrls: [
        'https://httpbin.org/get',
      ],
    })
  ]
})


provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))

provider.addSpanProcessor(new SimpleSpanProcessor(new CollectorExporter({
  url: `http://${window.location.hostname}:3001/i/logary?ot`
})))

// const exporter = new ZipkinExporter({
//   logger,
//   url: `http://${window.location.hostname}:3001/i/logary?zk`,
//   serviceName: 'with-nextjs',
// })
// provider.addSpanProcessor(new BatchSpanProcessor(exporter, { bufferTimeout: 2500 }))

provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator()
})

const tracer = provider.getTracer('with-nextjs')

export default tracer