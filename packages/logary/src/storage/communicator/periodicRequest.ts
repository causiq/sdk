import { Observable, merge, interval, combineLatest, from } from "rxjs"
import { filter, tap, bufferWhen } from "rxjs/operators"
import visibilityState from './visibilityState'

const windowTabChange = () => {
  if (typeof window === 'undefined') return from([])
  return visibilityState().pipe(
    filter(x => x === 'hidden'),
    tap(() => console.debug('visibilityState => "hidden"'))
  )
}

const windowBeforeUnload = () => new Observable<'unload'>(o => {
  if (typeof window === 'undefined') return o.complete()
  const sendSignal = () => o.next('unload')
  window.addEventListener('beforeunload', sendSignal)
  return () => window.removeEventListener('beforeunload', sendSignal)
})

const windowTabChangeOrUnload = () => {
  return merge(
    windowBeforeUnload(),
    windowTabChange()
  )
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
export default function periodicRequest<TRes>(
  connectivityStream: () => Observable<boolean>,
  makeRequests: Observable<TRes>,
  period: number = 500,
  extraTriggers: () => Observable<string> = windowTabChangeOrUnload
) {
  const trigger = () =>
    combineLatest([
      connectivityStream(),
      // this second parameter acts as the trigger, either every broadcast interval, or when the page is hidden
      merge(interval(period), extraTriggers())
    ]).pipe(
      tap(x => console.log('.')),
      filter(([online, _]) => online)
    )

  return makeRequests.pipe(bufferWhen(trigger))
}