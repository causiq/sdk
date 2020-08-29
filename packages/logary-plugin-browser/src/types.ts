import { HasTracer } from "logary"
import { Span } from "@opentelemetry/api"

export type BrowserPluginOptions = Readonly<{
  doNotMarkErrorHandled?: boolean;
}>

export type PageViewSpanHolder = HasTracer & {
  readonly pageViewSpan: Span;
  newPageViewSpan(): Span;
}