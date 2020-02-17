// Reading:
// - https://rxjs-dev.firebaseapp.com/
// - https://stackoverflow.com/questions/18603993/deleting-multiple-records-in-indexeddb-based-on-index
// - https://w3c.github.io/beacon/
// - https://caniuse.com/#search=beacon


export { default as connectityState } from './connectivityState'
export { default as getUnsent } from './getUnsent'

export { default as periodicIndexedDBSender } from './periodicIndexedDBSender'
export { default as periodicSender } from './periodicSender'
export { default as periodicRequest } from './periodicRequest'
export { default as visibilityState } from './visibilityState'

// implementations:
import * as indexedDBSchema from './indexedDBSchema'
export const indexedDB = indexedDBSchema



