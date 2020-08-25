import { Observable } from "rxjs"
import periodicRequest from "./periodicRequest"
import connectivityState from "./connectivityState"
import { tap, concatMap, mapTo } from "rxjs/operators"

/**
 * A function that takes a request factory `sendBatch` and
 * the storage location of the commands to be sent, and then
 * using the periodicRequest function, loops through the db's
 * contents and then sends the actual request.
 *
 * The 'createRequest' function should error on faults in sending
 * over the network.
 *
 * This function's observable should never error.
 */
export default function periodicSender<TKey extends IDBValidKey = string, TValue = any>(
  getBatch: () => Observable<[TKey, TValue][]>,
  sendBatch: (batch: [TKey, TValue][]) => Observable<Response>,
  afterSent: (keys: TKey[]) => Observable<number>
) {
  return periodicRequest(
    connectivityState,
    getBatch().pipe(
      tap(batch => console.debug('Found unsent batch', batch)),
      concatMap(batch =>
        sendBatch(batch).pipe(
          tap(bs => console.debug('Sent batch, now deleting from IndexedDB...', bs)),
          // TODO...
          concatMap(res =>
            afterSent(batch.map(([ key, ]) => key)).pipe(
              mapTo(res)
            )
          )
        )
      )
    )
  )
}