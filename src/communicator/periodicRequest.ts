import { Observable, merge, interval, combineLatest } from "rxjs";
import { filter, concatMap, tap } from "rxjs/operators";
import visibilityState from './visibilityState'

const triggerOnChangeTab = () =>
  visibilityState().pipe(
    filter(x => x === 'hidden'),
    tap(() => console.debug('visibilityState => "hidden"'))
  )

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
  connectivityStream: Observable<boolean>,
  makeRequests: () => Observable<TRes>,
  period: number = 500,
  extraTriggers: () => Observable<string> = triggerOnChangeTab
) {
  return combineLatest([
    connectivityStream,
    // this second parameter acts as the trigger, either every broadcast interval, or when the page is hidden
    merge(
      interval(period),
      extraTriggers(),
    )
  ])
    .pipe(
      filter(([online, _]) => online),
      concatMap(makeRequests)
    )
}