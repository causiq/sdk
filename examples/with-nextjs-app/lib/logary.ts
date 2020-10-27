import { ConsoleTarget, RuttaTarget, getLogary, LogLevel } from 'logary'
import nextjs from '@logary/plugin-nextjs'
import react from '@logary/plugin-react'

console.log('NEXT_PUBLIC_LOGARY_ENDPOINT', process.env.NEXT_PUBLIC_LOGARY_ENDPOINT)

const instance = getLogary({
  minLevel: LogLevel.debug,
  serviceName: 'with-nextjs',
  targets: [
    new ConsoleTarget(),
    new RuttaTarget({
      endpoint: process.env.NEXT_PUBLIC_LOGARY_ENDPOINT || 'https://i.logary.tech'
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