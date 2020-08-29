export const UniversalRendering = 'universal-rendering'
export const GlobalErrorHandling = 'global-error-handling'
export const GlobalClickHandling = 'global-click-handling'
export const GlobalLocationHandling = 'global-location-handling'
export const OpenTelemetryFeature = 'opentelemetry'
export const OpenTelemetryHasTracer = 'opentelemetry/has-tracer'

export interface HasFeatures {
  readonly features: string[];
  supports(feature: string): boolean;
}