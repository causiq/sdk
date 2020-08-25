import { of } from 'rxjs'
import { catchError, mergeMap, filter } from 'rxjs/operators'
import connectivityState from "../storage/communicator/connectivityState"
import periodicRequest from "../storage/communicator/periodicRequest"
import '../utils/BigInt-JSON-patch'
import { Config } from '../config'
import RuntimeInfo from '../runtimeInfo'
import { Target } from "../types"
import send from "../utils/send"

// TODO: implement Rutta target for shipping to Rutta from Browser, or from NodeJS over UDP

type RuttaConfig = Readonly<{
  endpoint: string;
  disabled: boolean;
}>

const DefaultEndpoint = '/i'

export default class RuttaTarget implements Target {
  constructor(endpointOrConfig: string | Partial<RuttaConfig> | undefined = DefaultEndpoint) {
    this.conf = 
      typeof endpointOrConfig === 'string'
        ? { endpoint: endpointOrConfig, disabled: false } 
        : { 
          endpoint: endpointOrConfig.endpoint || DefaultEndpoint,
          disabled: false,
          ...endpointOrConfig,
        }

  }

  private conf: RuttaConfig;

  name = 'rutta'

  run(_: Config, ri: RuntimeInfo) {
    if (this.conf.disabled) return

    return periodicRequest(connectivityState, ri.messages).pipe(
      filter(messages => messages.length > 0),
      mergeMap(messages => send(this.conf.endpoint, JSON.stringify(messages))),
      catchError(err => {
        // Network or other error, handle appropriately
        console.error(err)
        return of({ error: true, message: err.message })
      })
    ).subscribe()
  }
}