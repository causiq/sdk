import { Target } from "../targets";
import { Message } from "../message";
import periodicRequest from "../communicator/periodicRequest";
import connectivityState from "../communicator/connectivityState";
import { empty, Unsubscribable, of } from "rxjs";

// TODO: implement Rutta target for shipping to Rutta from Browser, or from NodeJS over UDP

export default class RuttaTarget implements Target {
  constructor () {
    this._state = typeof window !== 'undefined' ? this.start() : empty().subscribe();
  }

  _state: Unsubscribable

  start() {
    return periodicRequest(
      connectivityState(),
      () => {
        console.log("Would have sent awesomeness to Rutta, for great good", new Date().toISOString())
        return of(1)
      })
      .subscribe()
  }


  shutdown(): void {
    this._state.unsubscribe()
  }

  log(messages: Message[]) {
  }
}