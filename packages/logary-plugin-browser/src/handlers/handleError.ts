import Logary from "logary"
import { explode, stringify, prop } from '../utils'
import { BrowserPluginOptions } from "../types"

export default function handleError(logary: Logary, opts: BrowserPluginOptions) {
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