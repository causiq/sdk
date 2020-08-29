import Logary from "logary"
import { GlobalClickHandling, GlobalErrorHandling, GlobalLocationHandling, UniversalRendering } from "logary"
import { BrowserPluginOptions } from './types'
import { handleClick, handleError } from './handlers'
import { TracerModule, HasTracer } from "./tracer/types"

export const OpenTelemetryFeature = 'opentelemetry'

export const name = 'plugins/browser'


function subscribeToBodyMutations(observer: MutationObserver) {
  var bodyList = document.querySelector("body")
  if (bodyList == null) return

  observer.observe(bodyList, {
    childList: true,
    subtree: true
  })
}

const getHandlers = (logary: Logary, opts: BrowserPluginOptions) => [
  {
    name: GlobalErrorHandling,
    run() {
      const errorHandler = handleError(logary, opts)
      window.addEventListener('error', errorHandler)
      return () => {
        window.removeEventListener('error', errorHandler)
      }
    }
  },

  {
    name: GlobalClickHandling,
    run() {
     const clickHandler = handleClick(logary)
      window.addEventListener('click', clickHandler)
      return () => {
        window.removeEventListener('click', clickHandler)
      }
    }
  },

  {
    name: GlobalLocationHandling,
    run() {
      const logger = logary.getLogger('plugins', 'browser', 'location')
      let oldHref = window.location.href, oldTitle = window.document.title

      const observer = new MutationObserver(mutations => {
        mutations.forEach(_ => {
          let prevHref = oldHref, prevTitle = oldTitle

          if (oldHref != document.location.href) {
            oldHref = document.location.href
            oldTitle = document.title
            logger.info("Location changed to {href}", {
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
  }
]

export const features = [
  GlobalErrorHandling,
  GlobalClickHandling,
  GlobalLocationHandling,
  UniversalRendering,
  OpenTelemetryFeature
]

export default function browser(logary: Logary, opts: BrowserPluginOptions = {}) {
  if (typeof window === 'undefined') return

  logary.register({
    name,
    features,
    supports(f) {
      return features.indexOf(f) !== -1
    },
    run() {
      const factory = require('./tracer')
      const m: TracerModule & HasTracer = factory.default(logary)

      const unsubs: (() => void)[] = []

      for (const handler of getHandlers(logary, opts)) {
        unsubs.push(handler.run())
      }

      return () => {
        for (const unsub of unsubs) {
          unsub()
        }
      }
    }
  })
}