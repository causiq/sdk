import { ConsoleSpanExporter, BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/tracing'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'

// TO CONSIDER: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-api#simple-nodejs-example
const exporter =
  process.env.ENABLE_JAEGER === 'true'
    ? new JaegerExporter({ serviceName: 'with-nextjs' })
    : new ConsoleSpanExporter()

export const provider = new BasicTracerProvider()

provider.addSpanProcessor(new SimpleSpanProcessor(exporter))

const tracer = provider.getTracer('with-nextjs')
export default tracer