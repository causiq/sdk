import { of } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { catchError, mergeMap } from 'rxjs/operators'
import connectivityState from "../communicator/connectivityState"
import periodicRequest from "../communicator/periodicRequest"
import { Config } from '../config'
import RuntimeInfo from '../runtimeInfo'
import { Target } from "../target"

// TODO: implement Rutta target for shipping to Rutta from Browser, or from NodeJS over UDP

type RuttaConfig = Readonly<{ endpoint?: string; }>

export default class RuttaTarget implements Target {

  private endpoint: string;

  constructor({ endpoint = '/i' }: RuttaConfig) {
    this.endpoint = endpoint
  }

  name = 'rutta'

  run(_: Config, ri: RuntimeInfo) {
    return periodicRequest(connectivityState, ri.messages).pipe(
      mergeMap(messages => fromFetch(this.endpoint, {
        body: JSON.stringify(messages)
      })),
      catchError(err => {
        // Network or other error, handle appropriately
        console.error(err)
        return of({ error: true, message: err.message })
      })
    ).subscribe()
  }
}