import Logary from ".."
import { TracerModule, HasTracer } from "../tracer/types"

export const OpenTelemetryFeature = 'opentelemetry'

export const name = 'plugins/opentelemetry'

export const features = [
  OpenTelemetryFeature
]

export default function opentelemetry(logary: Logary) {
  logary.register({
    name,
    features,
    supports(feature) {
      return features.indexOf(feature) !== -1
    },
    run() {
      if (typeof window === 'undefined') return () => {}
      const factory = require('../tracer')
      const _: TracerModule & HasTracer = factory.default(logary)
      return () => {}
    }
  })
}