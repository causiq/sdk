import { Span, Tracer } from "@opentelemetry/api"
import Logary, { HasTracer, TracerModule, } from "logary"
import { BrowserPluginOptions, PageViewSpanHolder } from './types'
import { features } from './features'
import { PageViewEventName } from "./events"
import handlers from "./handlers"
import TracerWithRootPageView from "./tracer/rootViewTracer"
import createTracer from './tracer'

export const name = 'plugins/browser'
export * from './features'
export * from './events'

// TODO: custom ContextManager instead of overriding the tracer.getCurrentSpan()

class BrowserPlugin implements HasTracer, PageViewSpanHolder {
  constructor(
    private logary: Logary,
    private opts: BrowserPluginOptions = {}
  ) {
    if (typeof window === 'undefined') throw new Error('BrowserPlugin created, but window === "undefined"')
    const m: TracerModule & HasTracer = createTracer(logary)
    this.tracer = new TracerWithRootPageView(m.tracer, this)
    this._pageViewSpan = this.newPageViewSpan()
  }

  private _pageViewSpan: Span

  tracer: Tracer

  name = name
  features = features

  supports(feature: string) {
    return features.indexOf(feature) !== -1
  }

  // current root span:

  newPageViewSpan(): Span {
    const span = this.tracer.startSpan(PageViewEventName)
    // setActiveSpan(context, span)
    return this._pageViewSpan = span
  }

  get pageViewSpan(): Span {
    return this._pageViewSpan
  }

  // end current root span

  run() {
    const unsubs: (() => void)[] = []

    for (const handler of handlers) {
      unsubs.push(handler.run(this.logary, this.opts, this))
    }

    return () => {
      for (const unsub of unsubs) {
        unsub()
      }
    }
  }
}

export default function browser(logary: Logary, opts: BrowserPluginOptions = {}) {
  if (typeof window === 'undefined') return
  else logary.register(new BrowserPlugin(logary, opts))
}