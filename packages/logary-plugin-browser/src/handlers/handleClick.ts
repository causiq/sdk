import Logary from 'logary'
import { describeTarget } from '../utils'

export default function onClick(logary: Logary) {
  const logger = logary.getLogger('plugins', 'browser', 'onClick')
  return (e: MouseEvent) => {
    const clicked = describeTarget(e)
    // console.log("mouse event", e, 'selector', cssSelector)
    // console.log('selector', cssSelector)

    logger.info(clicked?.eventName || 'User clicked "{cssSelector}"', clicked)
  }
}