import Logary from 'logary'
import { getTargetSelector } from '../utils'

export default function onClick(logary: Logary) {
  const logger = logary.getLogger('plugins', 'browser', 'onClick')
  return (e: MouseEvent) => {
    const cssSelector = getTargetSelector(e)
    // console.log("mouse event", e, 'selector', cssSelector)
    // console.log('selector', cssSelector)

    logger.info('User clicked "{cssSelector}"', {
      cssSelector
    })
  }
}