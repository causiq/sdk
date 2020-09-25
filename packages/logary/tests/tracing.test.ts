import { Context, Span, SpanKind, SpanOptions, TraceFlags, Tracer } from "@opentelemetry/api"
import { BasicTracerProvider, SimpleSpanProcessor, Span as TSpan, Tracer as TTracer  } from "@opentelemetry/tracing"
import Logary, { LogLevel, HasTracer, OpenTelemetryFeature, OpenTelemetryHasTracer, LogaryExporter, Config } from '../src'
import { SpanMessage } from '../src/message'
import LogaryPlugin from "../src/plugin"
import StubTarget from '../src/targets/stub'

const newLogary = (stub: StubTarget = new StubTarget()) => {
  return new Logary({
    serviceName: 'ABC',
    minLevel: LogLevel.debug,
    targets: [stub],
  })
}

class InspectableTracer implements Tracer {
  constructor(logary: Logary) {
    this.provider = new BasicTracerProvider({})
    this.provider.addSpanProcessor(new SimpleSpanProcessor(new LogaryExporter(logary)))
    this.inner = new TTracer({ name: 'test', version: '1' }, {}, this.provider)
  }

  private provider: BasicTracerProvider
  private inner: TTracer

  current: Span | undefined

  getCurrentSpan(): Span | undefined {
    return this.current
  }

  startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    const span = this.current = new TSpan(this.inner, name, {
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: '6e0c63257de34c92',
      traceFlags: TraceFlags.NONE,
    }, SpanKind.INTERNAL, undefined, options?.links, options?.startTime)
    return span
  }

  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(span: Span, fn: T): ReturnType<T> {
    throw new Error("Method not implemented.")
  }
  bind<T>(target: T, context?: Span): T {
    throw new Error("Method not implemented.")
  }

}

class TracingPlugin implements HasTracer, LogaryPlugin {
  constructor(logary: Logary) {
    this.logary = logary
    this.tracer = new InspectableTracer(logary)
  }
  logary: Logary
  tracer: Tracer
  features = [ OpenTelemetryFeature, OpenTelemetryHasTracer ]
  name = 'TracingPlugin'
  run(config: Config) {
    return () => {}
  }
  supports(f: string) {
    return this.features.includes(f)
  }
}

describe('Span', () => {
  const stub = new StubTarget()
  const logary = newLogary(stub)
  logary.register(new TracingPlugin(logary))
  logary.start()

  it('returns the passed tracer', () => {
    const subject = logary.getTracer()
    expect(subject).toBeInstanceOf(InspectableTracer)
  })

  it('calculates correct start and finish', () => {
    const beforeStart = BigInt(Date.now() - 1) * BigInt('1000000')

    const span = logary.getTracer().startSpan('work')

    for (let index = 0; index < 1000; index++) {
      span.addEvent(`Event no ${index}`)
    }

    span.end()

    const afterEnd = BigInt(Date.now() + 1) * BigInt('1000000')

    expect(stub.messages[0]).not.toBeUndefined()

    const s = stub.messages[0] as SpanMessage
    expect(s.label).toEqual('work')

    // started after
    expect(s.started).toBeGreaterThan(beforeStart)
    expect(s.finished).toBeGreaterThan(beforeStart)

    // finished before
    expect(s.started).toBeLessThan(afterEnd)
    expect(s.finished).toBeLessThan(afterEnd)

    // internals
    expect(s.finished).toBeGreaterThan(s.started)

    // all its events
    for (const event of s.events) {
      expect(event.timestamp).toBeGreaterThan(beforeStart)
      expect(event.timestamp).toBeLessThan(afterEnd)
    }
  })
})