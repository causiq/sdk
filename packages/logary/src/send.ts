import { from, Observable } from "rxjs"

// @ts-ignore Let me, please https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
BigInt.prototype.toJSON = function() { return this.toString() }

export default function send(endpoint: string, data: string | Blob | FormData | URLSearchParams | ReadableStream<Uint8Array>) {
  if (typeof window !== 'undefined' && window.navigator.sendBeacon != null) {
    window.navigator.sendBeacon(endpoint, data)
    return from([])
  } else {
    // https://github.com/southpolesteve/node-abort-controller
    return new Observable<boolean>(o => {
      const AbortController = require('node-abort-controller')
      const controller = new AbortController()
      const signal = controller.signal
      const headers = {
        'content-type': 'application/json; charset=utf-8',
        'accept': 'application/json'
      }
      fetch(endpoint, { method: 'POST', body: data, signal, headers })
        .then(res => res.json())
        .then(json => {
          o.next(json)
          o.complete()
        })
        .catch(e => {
          o.error(e)
        })
    })
  }
}