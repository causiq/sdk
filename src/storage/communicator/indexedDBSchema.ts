import { Observable } from "rxjs"
import { concatMap } from "rxjs/operators"
import { createSchema, deleteByPK, toObservableFromCallback } from "../indexeddb"

// Communicator related code – eventual sending of message

export const MessageIndexName = 'mId_IX'

/**
 * Creates a schema that's specific to the batched-message-implementation.
 */
export function createIndexedDBSchema(db: IDBDatabase, objectStore: string) {
  // TODO: verify!
  const indicies = [
    {
      name: MessageIndexName,
      fields: 'messageId',
      opts: { unique: true }
    }
  ]
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
      const cursor = deleter.result
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