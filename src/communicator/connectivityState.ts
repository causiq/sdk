import { Observable } from "rxjs"

// NOTE: this module requires 'window' globally

/**
 * Gives you back a connectivity observable.
 */
export default function connectivityState(): Observable<boolean> {
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