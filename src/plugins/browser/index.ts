import Logary from "../.."
import { GlobalClickHandling, GlobalErrorHandling, UniversalRendering } from "../../utils/features"
import { ReactJSFeature } from "../react"
import getTargetSelector from "./getTargetSelector"

function prop(e: any, debug = false) {
  return (name: string, tx?: (x: any) => any) => {
    const value = e[name]

    if (value == null) return null

    if (tx != null && debug) {
      console.info('prop in:', value)
      const o = tx(value)
      console.info('prop out:', o)
      return o
    }

    if (tx != null) return tx(value)

    return value
  }
}

function stringify(ps: any | any[]): string {
  return Array.isArray(ps)
    ? ps.map(p => String(p)).join(',')
    : ps.constructor.name
}

function explode(p: undefined | null | string | string[]): string[] {
  if (p == null) return []
  return Array.isArray(p)
    ? p.map(x => x.toString())
    : typeof p === 'string'
      ? p.split(/\n/g)
      : [ String(p) ]
}

export type BrowserPluginOptions = Readonly<{
  doNotMarkErrorHandled?: boolean;
  /**
   * Enable, to debug the plugin
   */
  debugHandler?: boolean;
}>

function handleError(logary: Logary, opts: BrowserPluginOptions) {
  const logger = logary.getLogger('plugins', 'browser', 'onError')
  let lastError: Error | null = null

  // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
  return (errEvt: ErrorEvent) => {
    // check for reference equality, see https://github.com/facebook/react/issues/11499 and https://stackoverflow.com/questions/50201345/javascript-react-window-onerror-fired-twice
    if (lastError === errEvt.error) return !opts.doNotMarkErrorHandled
    else lastError = errEvt.error

    if (!opts.doNotMarkErrorHandled) errEvt.stopPropagation()
    if (opts.debugHandler) console.error(errEvt)

    const get = prop(errEvt, opts.debugHandler)

    logger.error('Unhandled window error', {
      error: {
        colNo: get('colno'),
        lineNo: get('lineno'),
        fileName: get('filename'),
        message: get('message'),
        stack: explode(errEvt.error.stack),
        path: get('path', stringify)
      }
    })

    if (opts.debugHandler) console.log('returning ', !opts.doNotMarkErrorHandled, 'from error handler')
    return !opts.doNotMarkErrorHandled
  }
}

function onClick(logary: Logary) {
  const logger = logary.getLogger('plugins', 'browser', 'onClick')
  return (e: MouseEvent) => {
    const cssSelector = getTargetSelector(e)
    // console.log("mouse event", e, 'selector', cssSelector)
    // console.log('selector', cssSelector)

    logger.info('Click event (global)', {
      cssSelector
    })
  }
}


export const name = 'plugins/browser'

export const features = [
  GlobalErrorHandling,
  GlobalClickHandling,
  UniversalRendering,
  ReactJSFeature
]


export default function browser(logary: Logary, opts: BrowserPluginOptions = {}) {
  if (typeof window === 'undefined') return

  const errorHandler = handleError(logary, opts), clickHandler = onClick(logary)

  logary.register({
    name,
    features,
    supports(f) {
      return features.indexOf(f) !== -1
    },
    run() {
      window.addEventListener('click', clickHandler)
      window.addEventListener('error', errorHandler)
      return () => {
        window.removeEventListener('click', clickHandler)
        window.removeEventListener('error', errorHandler)
      }
    }
  })
}