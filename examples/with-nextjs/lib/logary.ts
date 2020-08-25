import { ConsoleTarget, RuttaTarget, getLogary, LogLevel } from 'logary'
import browser from '@logary/plugin-browser'
import nextjs from '@logary/plugin-nextjs'
import react from '@logary/plugin-react'
import node from '@logary/plugin-node'

const instance = getLogary({
  minLevel: LogLevel.debug,
  serviceName: 'with-nextjs',
  targets: [
    new ConsoleTarget(),
    new RuttaTarget({
      endpoint: '/api/logary',
      disabled: typeof window === 'undefined'
    })
  ]
})

browser(instance, { debugHandler: false })
nextjs(instance)
react(instance)
// node(instance)

export default instance