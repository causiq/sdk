import Logary from "logary"
import { GlobalClickHandling, GlobalErrorHandling, UniversalRendering } from "logary"
import { BrowserPluginOptions } from './types'
import { handleClick, handleError } from './handlers'
import { TracerModule, HasTracer } from "./tracer/types"

export const OpenTelemetryFeature = 'opentelemetry'

export const name = 'plugins/browser'

export const features = [
  GlobalErrorHandling,
  GlobalClickHandling,
  UniversalRendering,
  OpenTelemetryFeature
]

export default function browser(logary: Logary, opts: BrowserPluginOptions = {}) {
  if (typeof window === 'undefined') return

  const errorHandler = handleError(logary, opts), clickHandler = handleClick(logary)

  logary.register({
    name,
    features,
    supports(f) {
      return features.indexOf(f) !== -1
    },
    run() {
      const factory = require('./tracer')
      const m: TracerModule & HasTracer = factory.default(logary)

      window.addEventListener('click', clickHandler)
      window.addEventListener('error', errorHandler)
      return () => {
        window.removeEventListener('click', clickHandler)
        window.removeEventListener('error', errorHandler)
      }
    }
  })
}