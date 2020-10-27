import { ConsoleTarget, RuttaTarget, getLogary, LogLevel } from 'logary'
import nextjs from '@logary/plugin-nextjs'
import react from '@logary/plugin-react'

const instance = getLogary({
  minLevel: LogLevel.debug,
  serviceName: 'with-nextjs',
  targets: [
    new ConsoleTarget(),
    new RuttaTarget({
      endpoint: 'https://i.logary.tech'
    })
  ]
})

// A workaround for following issue:
// https://github.com/open-telemetry/opentelemetry-js/issues/1575
if (typeof window !== "undefined") {
  const browser = require('@logary/plugin-browser').default
  browser(instance)
}
nextjs(instance)
react(instance)

export default instance