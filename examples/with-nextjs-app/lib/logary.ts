import { ConsoleTarget, RuttaTarget, StubTarget, getLogary, LogLevel } from 'logary'
import nextjs from '@logary/plugin-nextjs'
import react from '@logary/plugin-react'
import { LogaryWindow } from './LogaryWindow'

// Why this? Because process.env.NEXT_PUBLIC_LOGARY_ENDPOINT is compiled in
// and compiling with NODE_ENV=test causes an infinite crash loop in the browser.
const pars = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
const env = pars.get('env')

const stub = new StubTarget()

const instance = getLogary({
  minLevel: LogLevel.debug,
  serviceName: 'with-nextjs',
  targets: [
    new ConsoleTarget(),
    new RuttaTarget({
      endpoint:
        process.env.NEXT_PUBLIC_LOGARY_ENDPOINT
        || (env && env.includes('test') && '/api/logary')
        || 'https://i.logary.tech'
    }),
    ...(env === 'test' ? [ stub ] : [])
  ]
})

if (env === 'test') {
  const w = window as LogaryWindow
  w.logary = instance
  w.stubTarget = stub
}

// A workaround for following issue:
// https://github.com/open-telemetry/opentelemetry-js/issues/1575
if (typeof window !== "undefined") {
  const browser = require('@logary/plugin-browser').default
  browser(instance)
}

nextjs(instance)
react(instance)

export default instance