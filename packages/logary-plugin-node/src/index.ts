import Logary from "logary"
import {
  OpenTelemetryFeature,
  OpenTelemetryHasTracer,
  UniversalRendering,
  TracerModule,
  HasTracer 
} from "logary"
import { NodePluginOptions } from './types'
import { Tracer } from "@opentelemetry/api"
import createTracer from './tracer'

export const features = [
  UniversalRendering,
  OpenTelemetryFeature,
  OpenTelemetryHasTracer
]

class NodePlugin implements HasTracer {
  constructor(
    logary: Logary,
    opts: NodePluginOptions = {}
  ) {
    if (typeof window !== 'undefined') throw new Error('NodePlugin created, but window !== "undefined"')
    const m: TracerModule & HasTracer = createTracer(logary)
    this.tracer = m.tracer
  }

  tracer: Tracer

  name = name
  features = features

  supports(f: string) {
    return features.indexOf(f) !== -1
  }

  run() {
    return () => {}
  }
}

export default function node(logary: Logary, opts: NodePluginOptions = {}) {
  if (typeof window !== 'undefined') return
  logary.register(new NodePlugin(logary, opts))
}