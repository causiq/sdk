import { GlobalErrorHandling, GlobalClickHandling, GlobalLocationHandling, UniversalRendering, OpenTelemetryFeature, OpenTelemetryHasTracer } from "logary"

export const SpanPerNavigationFeature = 'opentelemetry/span-per-navigation'

export const WebVitalsFeature = 'plugins/browser/web-vitals'

export const features = [
  GlobalErrorHandling,
  GlobalClickHandling,
  GlobalLocationHandling,
  UniversalRendering,
  OpenTelemetryFeature,
  OpenTelemetryHasTracer,
  SpanPerNavigationFeature,
  WebVitalsFeature
]