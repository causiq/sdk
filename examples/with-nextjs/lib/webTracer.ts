import { B3Format } from '@opentelemetry/core'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing'
import { WebTracerProvider } from '@opentelemetry/web'
import { UserInteractionPlugin } from '@opentelemetry/plugin-user-interaction'
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request'
import { DocumentLoad } from '@opentelemetry/plugin-document-load'
import { ZoneScopeManager } from '@opentelemetry/scope-zone'
import { logger } from 'logary'

export const provider = new WebTracerProvider({
  httpTextFormat: new B3Format(),
  scopeManager: new ZoneScopeManager(),
  logger,
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

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

const tracer = provider.getTracer('with-nextjs')

export default tracer