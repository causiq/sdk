import { Observable, interval, combineLatest, merge } from 'rxjs'
import { concatMap, filter, mapTo, mergeMap, tap } from 'rxjs/operators'
import { createSchema, deleteByPK, toObservableFromCallback } from './index'

// Reading:
// - https://rxjs-dev.firebaseapp.com/
// - https://stackoverflow.com/questions/18603993/deleting-multiple-records-in-indexeddb-based-on-index
// - https://w3c.github.io/beacon/
// - https://caniuse.com/#search=beacon

// Communicator related code – eventual sending of message

export const MessageIndexName = 'mId_IX';

/**
 * Creates a schema that's specific to the batched-message-implementation.
 */
export function createIndexedDBSchema(db: IDBDatabase, objectStore: string) {
  // TODO: verify!
  const indicies = [
    {
      name: MessageIndexName,
      fields: 'fields.messageId',
      opts: { unique: true }
    }
  ];
  return createSchema(db, objectStore, indicies, {
    autoIncrement: true
  })
}

// helper functions for dealing with deleting by Message Id (see deleteMessage below)
function getPKFromMessageId(index: IDBIndex, mId: IDBValidKey) {
  if (typeof mId === 'undefined') throw new Error('Cannot delete by undefined Message id (mId).')
  return new Observable<string>(o => {
    const req = index.getKey(mId)
    req.onsuccess = () => {
      // WTF — why is it not on the event?!
      o.next(req.result as string)
      o.complete()
    }
    req.onerror = evt => {
      o.error(evt)
    }
  })
}

/**
 * `saveMessage` takes a realised database instance and an object store
 * and the message to save. The message can be an arbitrary javascript
 * object.
 */
export function saveMessage(db: IDBDatabase, objectStore: string, message: Record<string, any>) {
  return new Observable<IDBValidKey>(o => {
    const tx = db.transaction(objectStore, 'readwrite')
    const os = tx.objectStore(objectStore)
    const req = os.put(message)
    toObservableFromCallback(o, req, false, 'saveMessage')
  })
}

/**
 * Tries to delete the message by its Id from the underlying IndexedDB instance.
 */
export function deleteMessage(db: IDBDatabase, objectStore: string, mId: IDBValidKey): Observable<any> {
  if (mId == null) throw new Error('No value for "mId" was given')
  const tx = db.transaction(objectStore, 'readwrite')
  const os = tx.objectStore(objectStore)
  const byIdIndex = os.index(MessageIndexName)
  return getPKFromMessageId(byIdIndex, mId).pipe(concatMap(pk => deleteByPK(os, pk)))
}

/**
 * Deletes a batch of messages.
 *
 * @param db
 * @param objectStore
 * @param messageKeys
 */
export function deleteMessages(db: IDBDatabase, objectStore: string, messageKeys: IDBValidKey[]) {
  return new Observable<number>(o => {
    const tx = db.transaction(objectStore, 'readwrite')
    const os = tx.objectStore(objectStore)
    const byIdIndex = os.index(MessageIndexName)

    let count = 0
    const deleter = byIdIndex.openKeyCursor(IDBKeyRange.only(messageKeys))

    deleter.onsuccess = () => {
      var cursor = deleter.result
      if (cursor) {
        os.delete(cursor.primaryKey)
        count++
        cursor.continue()
      } else {
        o.next(count)
        o.complete()
      }
    }

    deleter.onerror = evt => {
      console.error('Cursor for keys', messageKeys, 'errored after', count, 'deletions.')
      o.error(evt)
    }
  })
}

/**
 * Gets the unsent Message batches, still to be sent over the network.
 */
export function getUnsent<TKey extends IDBValidKey = IDBValidKey, TValue = Record<string, any>>(
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

/**
 * Gives you back a connectivity observable.
 */
export function connectivityState(): Observable<boolean> {
  return new Observable(o => {
    const onOnline = () => o.next(true)
    const onOffline = () => o.next(false)

    o.next(window.navigator.onLine)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  })
}

/**
 * Let's you act with the Beacon API when the browser page is hidden
 * Docs: https://w3c.github.io/beacon/
 */
export function visibilityState(): Observable<'hidden' | 'visible'> {
  return new Observable(o => {
    o.next(window.document.visibilityState)

    const handle = () => o.next(window.document.visibilityState)

    window.addEventListener('visibilitychange', handle)
    return () => window.removeEventListener('visibilitychange', handle)
  })
}

/**
 * Creates an observable that fires in a regular interval, while
 * the browser is online, as specified by the Observable[boolean]
 * that is the first parameter. Will call makeRequests and expect it
 * to return an observable of values back, that are then merged
 * to produce the result.
 *
 * The observable is cold, so you'll need to subscribe it to
 * wake its scheduler.
 */
export function periodicRequest<TRes>(
  connectivityStream: Observable<boolean>,
  makeRequests: () => Observable<TRes>,
  period: number = 500
) {
  return combineLatest([
    connectivityStream,
    // this second parameter acts as the trigger, either every broadcast interval, or when the page is hidden
    merge(
      interval(period),
      visibilityState().pipe(
        filter(x => x === 'hidden'),
        tap(() => console.debug('visibilityState => "hidden"'))
      )
    )
  ])
    .pipe(
      filter(([online, _]) => online),
      concatMap(makeRequests)
    )
}

/**
 * A function that takes a request factory 'createRequest' and
 * the storage location of the commands to be sent, and then
 * using the periodicRequest function, loops through the db's
 * contents and then sends the actual request.
 *
 * The 'createRequest' function should error on faults in sending
 * over the network.
 *
 * This function's observable should never error.
 */
export const periodicSender = <TKey extends IDBValidKey = string, TValue = any>(
  sendBatch: (batch: [TKey, TValue][]) => Observable<Response>,
  db: IDBDatabase,
  objectStore: string
) =>
  periodicRequest(
    connectivityState(),
    () => getUnsent<TKey, TValue>(db, objectStore).pipe(
      tap(batch => console.debug('Found unsent batch', batch)),
      concatMap(batch =>
        sendBatch(batch).pipe(
          tap(batch => console.debug('Sent batch, now deleting from IndexedDB...', batch)),
          concatMap(res =>
            deleteMessages(db, objectStore, batch.map(([k, ]) => k)).pipe(
              mapTo(res)
            )
          )
        )
      )
    )
  )