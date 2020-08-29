import { tap } from 'rxjs/operators'

export default function monitor<T>(name: string, enabled?: boolean) {
  return tap<T>(
    value => {
      if (enabled) console.log(`${name}$ value: `, value)
    },
    error => {
      if (enabled) console.log(`${name}$ error: `, error)
    },
    () => {
      if (enabled) console.log(`${name}$ complete.`)
    }
  )
}