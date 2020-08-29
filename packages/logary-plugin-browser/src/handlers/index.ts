import { Span } from "@opentelemetry/api"
import Logary, { EventMessage, GlobalClickHandling, GlobalErrorHandling, GlobalLocationHandling } from "logary"
import { fromEvent, merge, Observable } from 'rxjs'
import { filter, mapTo, scan } from 'rxjs/operators'
import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric as WebVitalMetric } from 'web-vitals'
import { LocationChangedToHrefEventName } from "../events"
import { SpanPerNavigationFeature } from "../features"
import monitor from "../operators/monitor"
import { BrowserPluginOptions, PageViewSpanHolder } from "../types"
import subscribeToBodyMutations from "../utils/subscribeToBodyMutations"
import handleClick from './handleClick'
import handleError from './handleError'

type InnerUnsubscribe = () => void;

type InnerHandler = Readonly<{
  name: string;
  run: (logary: Logary, opts: BrowserPluginOptions, holder: PageViewSpanHolder) => InnerUnsubscribe;
}>

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
        mutations.forEach(() => {
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
    run(logary, _, tm) {
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
      let metrics: [string, WebVitalMetric][] = []

      function handleMetric(metric: WebVitalMetric) {
        if (cancelled) return
        metrics.push([`webvitals.${metric.name.toLowerCase()}`, metric])
      }

      function writeCapturedMetrics(span: Span) {
        for (const [metricName, metric] of metrics) {
          span.setAttribute(metricName, metric.value)
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
      const emptyState: Readonly<{ prevEvent: string | null; span: Span | null }> =
        { prevEvent: null, span: tm.pageViewSpan }

      const span$ = merge(load$, beforeunload$, navEvent$).pipe(
        scan(({ span }, event) => {
          if (span != null && event !== 'load') {
            // when finishing off the span, write all captured metrics to it
            writeCapturedMetrics(span)
            span.end()
          }

          span = tm.newPageViewSpan()
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

export default handlers