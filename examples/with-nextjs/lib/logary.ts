import { getLogaryInstance, LogLevel } from "../../../dist"
import browser from '../../../dist/plugins/browser'
import nextjs from '../../../dist/plugins/nextjs'
import react from '../../../dist/plugins/react'
import ConsoleTarget from '../../../dist/targets/console'

const instance = getLogaryInstance({
  minLevel: LogLevel.debug,
  serviceName: 'with-nextjs',
  targets: [
    new ConsoleTarget()
  ]
})

browser(instance, { debugHandler: false })
nextjs(instance)
react(instance)

export default instance