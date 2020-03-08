import { Observable } from "rxjs"

// NOTE: this module requires 'window' globally

/**
 * Let's you act with the Beacon API when the browser page is hidden
 * Docs: https://w3c.github.io/beacon/
 */
export default function visibilityState(): Observable<VisibilityState> {
  return new Observable(o => {
    o.next(window.document.visibilityState)

    const handle = () => o.next(window.document.visibilityState)

    window.addEventListener('visibilitychange', handle)
    return () => window.removeEventListener('visibilitychange', handle)
  })
}
