import Logary from "logary"
import { UniversalRendering } from "logary"

export const ReactJSFeature = 'reactjs'

export const name = 'plugins/react'

export const features = [
  UniversalRendering,
  ReactJSFeature,
]

export const ExtraProp = "__lyNames"

export default function react(logary: Logary) {
  if (typeof window === 'undefined') return

  // see https://github.com/facebook/react/blob/16.8.6/packages/react-dom/src/client/ReactDOM.js#L817
  const { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: x } = require('react-dom')

  let injectEventPluginsByName: (conf: any) => void
  if (x && x.Events && x.Events[3]) {
    injectEventPluginsByName = x.Events[3]
  } else {
    injectEventPluginsByName = () => console.warn('logary does not work with this version of React')
  }

  logary.register({
    name,
    features,
    supports(f) {
      return features.indexOf(f) !== -1
    },
    run() {
      injectEventPluginsByName({
        ResponderEventPlugin: {
          extractEvents: function logaryReactDOMHook(topLevelType: string, targetInst: any, fiberNode: any, nativeEvent: any) {
            try {
              if (topLevelType !== 'click' || !fiberNode || !nativeEvent) return

              let currentElement = fiberNode

              const names = []
              while (currentElement) {
                const n = typeof currentElement.elementType === 'function' && currentElement.elementType.displayName
                if (n) names.push(n)
                currentElement = currentElement.return
              }
              nativeEvent[ExtraProp] = names
            } catch (error) {
              console.error('logary caught an error while hooking into React. Please make sure you are using the correct version of logary for your version of react-dom.')
            }
          },
        },
      })
    }
  })
}
