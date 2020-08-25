import { Observable } from "rxjs"
import periodicSender from "./periodicSender"
import getUnsent from "./getUnsent"
import { deleteMessages } from './indexedDBSchema'

export default function periodicIndexedDBSender<TKey extends IDBValidKey = string, TValue = any>(
  db: IDBDatabase,
  objectStore: string,
  sendBatch: (batch: [TKey, TValue][]) => Observable<Response>
) {
  return periodicSender(
    () => getUnsent<TKey, TValue>(db, objectStore),
    sendBatch,
    keys => deleteMessages(db, objectStore, keys))
}
