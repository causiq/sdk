import * as api from "@opentelemetry/api"
import { PageViewSpanHolder } from "../types"

export default class TracerWithRootPageView implements api.Tracer {
  constructor(private inner: api.Tracer, private plugin: PageViewSpanHolder) {}

  getCurrentSpan(): api.Span | undefined {
    return this.plugin.pageViewSpan || this.inner.getCurrentSpan()
  }

  startSpan(name: string, options?: api.SpanOptions | undefined, context?: api.Context | undefined): api.Span {
    return this.inner.startSpan(name, {
      parent: this.getCurrentSpan(),
      ...(options || {})
    }, context)
  }

  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(span: api.Span, fn: T): ReturnType<T> {
    return this.inner.withSpan(span, fn)
  }

  bind<T>(target: T, context?: api.Span | undefined): T {
    return this.inner.bind(target, context)
  }
}