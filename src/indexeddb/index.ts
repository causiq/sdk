import { Observable, Observer } from 'rxjs'

// Reading:
// - https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/indexeddb-best-practices
// - https://developers.google.com/web/fundamentals/instant-and-offline/offline-ux
// - https://rxjs-dev.firebaseapp.com/guide/observable

// @ts-ignore
const indexedDB: IDBFactory =
  typeof window !== 'undefined'
    // @ts-ignore
    ? window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB
    : null;

const IDBKeyRange =
  typeof window !== 'undefined'
    // @ts-ignore
    ? window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
    : { only: (arg: string) => null }

if (indexedDB == null) {
  console.error(
    "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
  )
}

/**
 * Create a new database as an observable that yields a single value (the database instance)
 * and then completes. May also fire error callbacks.
 */
export function createDatabase(
  dbName: string,
  schemaVersion: number,
  onUpgradeNeeded: (arg0: any) => void
): Observable<IDBDatabase> {
  return new Observable(o => {
    const req = indexedDB.open(dbName, schemaVersion);
    // will happen before onsuccess unless the schema exist
    // @flow-ignore I don't know why it doesn't find the type
    req.onupgradeneeded = (evt: IDBVersionChangeEvent) => {
      //console.debug('onupgradeneeded', evt);
      // OnUpgradeNeeded.IndexedDbRequest.Instance
      // @ts-ignore
      onUpgradeNeeded(evt.target.result);
    };
    req.onsuccess = (evt: Event) => {
      // pass the db instance
      //console.debug('Instantiated database', evt.target.result);
      // @ts-ignore
      o.next(evt.target.result)
      o.complete()
    };
    req.onerror = function(evt) {
      console.error(`Cannot create database '${dbName}'`, evt); // eslint-disable-line no-console
      o.error(evt)
      o.complete()
    }
  })
}

export type IndexSpec = Readonly<{
  name: string;
  fields: string | string[];
  opts: Object;
}>

// opts: for fn 'createObjectStore'.

/**
 * Create a schema from the given parameters.
 */
export function createSchema(db: IDBDatabase, objectStore: string, indicies: IndexSpec[], opts: Object): void {
  const store = db.createObjectStore(objectStore, opts || { keyPath: 'id' })
  indicies.forEach(current => {
    //console.log('creating index', current.name, current.fields, current.opts)
    store.createIndex(current.name, current.fields, current.opts || {})
  })
}

// internal function to handle the callbacks from the annoying
// requests, do not use this function outside the module (idb)
export function toObservableFromCallback<T = any, TResult = T>(
  o: Observer<TResult>,
  req: IDBRequest<T>,
  undefinedIsError: boolean,
  caller: string,
  mapper?: (result: T) => TResult
): void {
  req.onsuccess = evt => {
    if (typeof req.result === 'undefined' && undefinedIsError) {
      const err = new Error(`Result is undefined. Called from ${caller}`)
      // @ts-ignore
      err.request = req
      // @ts-ignore
      err.event = evt
      o.error(err)
    } else {
      if (mapper != null) {
        o.next(mapper(req.result))
      } else {
        o.next(req.result as unknown as TResult)
      }
    }
    o.complete()
  }

  req.onerror = evt => {
    console.error('Error in toObservableFromCallback (lower level code)', evt)
    o.error(evt)
  }
}

// internal function to handle the CURSOR callbacks from the annoying
// requests, do not use this function outside the module (idb)
export function toObservableFromCursorCallback(o: Observer<IDBObjectStore>, req: IDBRequest, caller: string): void {
  req.onsuccess = function(evt) {
    // @ts-ignore
    const cursor = evt.target.result
    if (cursor != null) {
      o.next(cursor.value)
      cursor.continue()
    } else {
      o.complete()
    }
  };

  req.onerror = evt => {
    console.error('Error in toObservableFromCallback (lower level code)', evt)
    o.error(evt)
  }
}

/**
 * Gets something from the passed object store by id.
 */
export function getById(db: IDBDatabase, objectStore: string, id: string): Observable<any> {
  if (typeof id == null) throw new Error('Parameter "id" must not be null.')
  return new Observable(o => {
    const tx = db.transaction(objectStore, 'readonly')
    const os = tx.objectStore(objectStore)
    const req = os.get(id)
    toObservableFromCallback(o, req, true, 'getById')
  })
}

/*
 * Get all entries in an index with specific key
 */
export function getByIndexId(db: IDBDatabase, objectStore: string, index: string, id: string): Observable<any> {
  if (typeof id == null) throw new Error('Parameter "id" must not be null.')
  return new Observable(o => {
    const tx = db.transaction(objectStore, 'readonly')
    const os = tx.objectStore(objectStore)
    const ix = os.index(index)
    const keyRange = IDBKeyRange.only(id)
    const req = ix.openCursor(keyRange)
    toObservableFromCursorCallback(o, req, 'getByIndexId')
  })
}

/**
 * Update object field
 */
export function updateFieldById(db: IDBDatabase, objectStore: string, id: string): Observable<any> {
  if (typeof id == null) throw new Error('Parameter "id" must not be null.')
  return new Observable(o => {
    const tx = db.transaction(objectStore, 'readwrite')
    const os = tx.objectStore(objectStore)
    const req = os.get(id)
    toObservableFromCallback(o, req, true, 'getById')
  });
}

export function deleteByPK(os: IDBObjectStore, pk: IDBValidKey) {
  if (typeof pk === 'undefined') throw new Error('Cannot delete by undefined PK.')
  return new Observable<boolean>(o => {
    const rows = os.delete(pk)
    toObservableFromCallback(o, rows, false, 'deleteByPK', res => typeof res === 'undefined')
  })
}

/**
 * Tries to delete the ExpenseDocument by its id from the underlying IndexedDB instance.
 */
export function deleteById(db: IDBDatabase, objectStore: string, id: string) {
  if (typeof id == null) throw new Error('Parameter "id" must not be null.');
  return new Observable<boolean>(o => {
    const tx = db.transaction(objectStore, 'readwrite')
    const os = tx.objectStore(objectStore)
    const req = os.delete(id)
    toObservableFromCallback(o, req, false, 'deleteById', res => typeof res === 'undefined')
    return () => {}
  })
}

/**
 * Creates an ArrayBuffer from a File.
 * iOS has difficulties storing Blobs.
 */
export function toArrayBufferObservableFromFile(o: Observer<ArrayBuffer>, f: File): void {
  const reader = new FileReader()
  reader.readAsArrayBuffer(f)
  reader.onloadend = evt => {
    if (typeof reader.result === 'undefined') {
      const err = new Error(`toArrayBufferObservableFromFile Result is undefined.`);
      // @ts-ignore
      err.event = evt
      o.error(err)
    } else {
      // @ts-ignore We used 'readAsArrayBuffer' above, so we don't get a string here.
      o.next(reader.result)
    }
    o.complete()
  };
  reader.onerror = err => o.error(err)
}

export function toFileFromArrayBuffer(buffer: ArrayBuffer, name: string, opts: Object = {}): File {
  return new File([buffer], name, opts)
}
