import { Observable } from "rxjs"

/**
 * Gets the unsent Message batches, still to be sent over the network.
 */
export default function getUnsent<TKey extends IDBValidKey = IDBValidKey, TValue = Record<string, any>>(
  db: IDBDatabase,
  objectStore: string,
  batchSize: number = 100
): Observable<[TKey, TValue][]> {

  return new Observable(o => {
    const tx = db.transaction(objectStore, 'readonly')
    const os = tx.objectStore(objectStore)
    const creq = os.openCursor()

    let batch: [TKey, TValue][] = []

    function handleResult(key: TKey, value: TValue) {
      batch.push([key, value])

      if (batch.length >= batchSize) {
        o.next(batch)
        batch = []
      }
    }

    function trySend() {
      if (batch.length > 0) o.next(batch)
      batch = []
    }

    creq.onsuccess = () => {
      if (creq.result != null) {
        handleResult(creq.result.key as TKey, creq.result.value)
        creq.result.continue()
      } else {
        trySend()
        o.complete()
      }
    }

    creq.onerror = event => {
      o.error(event)
    }
  })
}