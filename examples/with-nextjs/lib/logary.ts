import { getLogary, LogLevel } from "../../../dist"
import browser from '../../../dist/plugins/browser'
import nextjs from '../../../dist/plugins/nextjs'
import react from '../../../dist/plugins/react'
import opentelemetry from '../../../dist/plugins/opentelemetry'
import ConsoleTarget from '../../../dist/targets/console'
import RuttaTarget from '../../../dist/targets/rutta'

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
opentelemetry(instance)

export default instance