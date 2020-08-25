import { TracerModule } from "./types"
import { SpanExporter, SimpleSpanProcessor } from "@opentelemetry/tracing"
import Logary from "logary"

export default function create(delegator: SpanExporter, logary: Logary): TracerModule {
  // console.log('creating webTracer')
  const { DocumentLoad } = require('@opentelemetry/plugin-document-load')
  const { WebTracerProvider } = require('@opentelemetry/web')
  const { ZoneContextManager } = require('@opentelemetry/context-zone')

  // create the default web tracer provider
  const provider = new WebTracerProvider({
    logger: logary.getLogger('Logary', 'webTracer'),
    plugins: [ new DocumentLoad() ],
  })

  // delegate into Logary
  provider.addSpanProcessor(new SimpleSpanProcessor(delegator))

  // track async operations; overlapping async ops will most often be parent-child related,
  // unless explicitly created through the returned tracer
  provider.register({
    contextManager: new ZoneContextManager()
  })
  // provider.register()

  return { provider }
}