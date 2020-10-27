import Logary from "logary"
import { UniversalRendering } from "logary"

export const ReactJSFeature = 'reactjs'

export const name = 'plugins/react'

export const features = [
  UniversalRendering,
  ReactJSFeature,
]

export const ExtraProp = "__lyNames"

export { default as useLogary, LogaryProvider } from './useLogary'
export { default as useLogger } from './useLogger'

export default function react(logary: Logary) {
  if (typeof window === 'undefined') return

  logary.register({
    name,
    features,
    supports(f: string) {
      return features.indexOf(f) !== -1
    },
    run() {}
  })
}
