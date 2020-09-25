import { Tracer, Span, SpanOptions } from "@opentelemetry/api"
import { Context } from "@opentelemetry/context-base"
import { PageViewSpanHolder } from "../types"

export default class TracerWithRootPageView implements Tracer {
  constructor(private inner: Tracer, private plugin: PageViewSpanHolder) { }

  getCurrentSpan(): Span | undefined {
    return this.plugin.pageViewSpan || this.inner.getCurrentSpan()
  }

  startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    return this.inner.startSpan(name, {
      parent: this.getCurrentSpan(),
      ...(options || {})
    }, context)
  }

  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(span: Span, fn: T): ReturnType<T> {
    return this.inner.withSpan(span, fn)
  }

  bind<T>(target: T, context?: Span | undefined): T {
    return this.inner.bind(target, context)
  }
}