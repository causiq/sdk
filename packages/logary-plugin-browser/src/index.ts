import { Span, Tracer } from "@opentelemetry/api"
import Logary, {
  EventMessage,
  GlobalClickHandling,
  GlobalErrorHandling,
  GlobalLocationHandling,
  HasTracer,
  OpenTelemetryFeature,
  OpenTelemetryHasTracer,
  TracerModule,
  UniversalRendering
} from "logary"
import { fromEvent, merge, Observable } from 'rxjs'
import { filter, mapTo, scan } from 'rxjs/operators'
import { handleClick, handleError } from './handlers'
import monitor from "./operators/monitor"
import { BrowserPluginOptions } from './types'
import { Metric, getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals'

export const SpanPerNavigationFeature = 'opentelemetry/span-per-navigation'

export const WebVitalsFeature = 'plugins/browser/web-vitals'

export const name = 'plugins/browser'

function subscribeToBodyMutations(observer: MutationObserver) {
  const bodyList = document.querySelector("body")
  if (bodyList == null) return

  observer.observe(bodyList, {
    childList: true,
    subtree: true
  })
}

type InnerUnsubscribe = () => void;

type InnerHandler = Readonly<{
  name: string;
  run: (logary: Logary, opts: BrowserPluginOptions) => InnerUnsubscribe;
}>

const LocationChangedToHrefEventName = 'Location changed to {href}'
const PageViewEventName = 'Page view'

const handlers: InnerHandler[] = [
  {
    name: GlobalErrorHandling,
    run(logary, opts) {
      const errorHandler = handleError(logary, opts)
      window.addEventListener('error', errorHandler)
      return () => {
        window.removeEventListener('error', errorHandler)
      }
    }
  },

  {
    name: GlobalClickHandling,
    run(logary, _) {
      const clickHandler = handleClick(logary)
      window.addEventListener('click', clickHandler)
      return () => {
        window.removeEventListener('click', clickHandler)
      }
    }
  },

  {
    name: GlobalLocationHandling,
    run(logary, _) {
      const logger = logary.getLogger('plugins', 'browser', 'location')
      let oldHref = window.location.href, oldTitle = window.document.title

      const observer = new MutationObserver(mutations => {
        mutations.forEach(_ => {
          const prevHref = oldHref, prevTitle = oldTitle

          if (oldHref != document.location.href) {
            oldHref = document.location.href
            oldTitle = document.title
            logger.info(LocationChangedToHrefEventName, {
              prevHref,
              href: oldHref,
              prevTitle,
              title: oldTitle
            })
          }
        })
      })

      const subscribeAfterLoad = () => subscribeToBodyMutations(observer)

      window.addEventListener('load', subscribeAfterLoad)
      return () => {
        window.removeEventListener('load', subscribeAfterLoad)
        observer.disconnect()
      }
    }
  },

  {
    name: SpanPerNavigationFeature,
    run(logary, _) {
      if (logary.debug) console.log(`Starting ${SpanPerNavigationFeature} concern in @logary/plugin-browser`)


      // interesting events
      const load$: Observable<'load'> = fromEvent<Event>(window, 'load').pipe(
        mapTo('load'),
      )

      const beforeunload$: Observable<'beforeunload'> = fromEvent<BeforeUnloadEvent>(window, 'beforeunload').pipe(
        mapTo('beforeunload'),
      )

      const navEvent$: Observable<'navigate'> = logary.messages.pipe(
        filter(m => m.type === 'event'),
        filter(m => (m as EventMessage).event === LocationChangedToHrefEventName)
      ).pipe(
        mapTo('navigate')
      )


      // web vitals
      let cancelled = false
      let metrics: [string, Metric][] = []

      function handleMetric(metric: Metric) {
        if (cancelled) return
        metrics.push([`webvitals.${metric.name.toLowerCase()}`, metric])
      }

      function writeCapturedMetrics(span: Span) {
        for (const [name, metric] of metrics) {
          span.setAttribute(name, metric.value)
        }
        metrics = []
      }

      // https://github.com/GoogleChrome/web-vitals#core-web-vitals
      getCLS(handleMetric)
      getFCP(handleMetric)
      getFID(handleMetric)
      getLCP(handleMetric)
      getTTFB(handleMetric)


      // Page view handling
      const newSpan = () => logary.getTracer().startSpan(PageViewEventName)

      const emptyState: Readonly<{ prevEvent: string | null; span: Span | null }> =
        { prevEvent: null, span: newSpan() }

      const span$ = merge(load$, beforeunload$, navEvent$).pipe(
        scan(({ span }, event) => {
          if (span != null && event !== 'load') {
            // when finishing off the span, write all captured metrics to it
            writeCapturedMetrics(span)
            span.end()
          }

          span = newSpan()
          span.setAttributes({
            'location.href': window.location.href,
            'location.pathname': window.location.pathname,
            'document.title': document.title,
            'document.clientWidth': Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            'document.clientHeight': Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
            'navigator.userAgent': navigator.userAgent,
            'navigator.appName': navigator.appName,
            'navigator.appVersion': navigator.appVersion,
            'device.width': Math.max(window.screen.width, window.screen.availWidth),
            'device.height': Math.max(window.screen.height, window.screen.availHeight),
          })
          return { span, prevEvent: event }
        }, emptyState),
        monitor('span', logary.debug)
      )

      const sub = span$.subscribe()

      return () => {
        sub.unsubscribe()
        cancelled = true
      }
    }
  },
]

export const features = [
  GlobalErrorHandling,
  GlobalClickHandling,
  GlobalLocationHandling,
  UniversalRendering,
  OpenTelemetryFeature,
  OpenTelemetryHasTracer,
  SpanPerNavigationFeature
]

class BrowserPlugin implements HasTracer {
  constructor(
    private logary: Logary,
    private opts: BrowserPluginOptions = {}
  ) {
    if (typeof window === 'undefined') throw new Error('BrowserPlugin created, but window === "undefined"')
    const factory = require('./tracer/index')
    const m: TracerModule & HasTracer = factory.default(logary)
    this.tracer = m.tracer
  }

  tracer: Tracer

  name = name
  features = features

  supports(feature: string) {
    return features.indexOf(feature) !== -1
  }

  run() {
    const unsubs: (() => void)[] = []

    for (const handler of handlers) {
      unsubs.push(handler.run(this.logary, this.opts))
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
  logary.register(new BrowserPlugin(logary, opts))
}