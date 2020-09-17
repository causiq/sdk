import { RuttaTarget, getLogary, LogLevel, ConsoleTarget } from 'logary'
import browser from '@logary/plugin-browser'
import nextjs from '@logary/plugin-nextjs'
import react from '@logary/plugin-react'

const instance = getLogary({
  minLevel: LogLevel.debug,
  serviceName: 'with-nextjs',
  targets: [
    // new ConsoleTarget(x => x.type === 'event'),
    new ConsoleTarget(),
    new RuttaTarget({
      // endpoint: '/api/logary',
      // endpoint: 'http://localhost:8080/i',
      // endpoint: 'https://api.logary.test/i',
      endpoint: 'https://i.logary.tech',
      // endpoint: 'http://localhost:8080/i',
      disabled: false //typeof window === 'undefined',
    })
  ],
  appId: 'LA-123456',
  debug: false
})

browser(instance)
nextjs(instance)
react(instance)

export default instance