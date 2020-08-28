import '../utils/BigInt-JSON-patch'
import { interval, timer } from 'rxjs'
import { mergeMap, filter, bufferWhen, retryWhen, delayWhen, take } from 'rxjs/operators'
import { Config } from '../config'
import RuntimeInfo from '../runtimeInfo'
import { Target } from "../types"
import sendBeacon from "../utils/sendBeacon"
import { Message } from "../message"

// TODO: implement Rutta target for shipping to Rutta from Browser, or from NodeJS over UDP
// Alt: https://medium.com/angular-in-depth/power-of-rxjs-when-using-exponential-backoff-a4b8bde276b0
//      https://github.com/alex-okrushko/backoff-rxjs/blob/master/src/operators/retryBackoff.ts
// Ref: https://rxjs-dev.firebaseapp.com/api
// Ref: https://rxmarbles.com/#bufferWhen

export type RuttaConfig = Readonly<{
  endpoint: string;
  disabled: boolean;
  period: number;
}>

export const DefaultRuttaEndpoint =
  typeof window === 'undefined'
    ? process.env.LOGARY_RUTTA_ENDPOINT || 'http://rutta/i'
    : '/i'

export const DefaultConfig: RuttaConfig = {
  endpoint: DefaultRuttaEndpoint,
  disabled: false,
  period: 2000
}
const initialDelay = 1000
const maxRetries = 4

export default class RuttaTarget implements Target {
  constructor(endpointOrConfig: string | Partial<RuttaConfig> | undefined) {
    if (endpointOrConfig == null) {
      this.conf = DefaultConfig
    } else if (typeof endpointOrConfig === 'string') {
      this.conf = {
        ...DefaultConfig,
        endpoint: endpointOrConfig
      }
    } else {
      this.conf = {
        ...DefaultConfig,
        ...endpointOrConfig
      }
    }
  }

  private conf: RuttaConfig;

  name = 'rutta'

  run(_: Config, ri: RuntimeInfo) {
    if (this.conf.disabled) {
      if (ri.debug) console.log('Shipping to Logary Rutta')
      return () => {}
    }

    const closingSelector = () => {
      return interval(this.conf.period)
    }

    const sendBatches = ri.messages.pipe(
      bufferWhen(closingSelector),
      filter(messages => messages.length > 0),
      mergeMap(messages => sendBeacon(this.conf.endpoint, JSON.stringify(messages))),
      retryWhen(errors =>
        // https://stackoverflow.com/a/53832713/63621
        errors.pipe(
          delayWhen((error, i) => {
            // const delay = (i+1)*initialDelay;            // geometric
            const delay = Math.pow(2,i)*initialDelay       // exponential
            console.log(`Retrying after ${delay} msec...`, error)
            return timer(delay)
          }),
          take(maxRetries)
        )
      )
    )

    return sendBatches.subscribe()
  }
}