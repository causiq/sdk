import { Target } from '../types'
import { Subscription } from 'rxjs'
import RuntimeInfo from '../runtimeInfo'
import { Config } from '../config'
import { Message } from '../message'

/**
 * This target logs everything it get to memory. You really should not use this outside tests, or
 * else your memory consumption will grow forever until your app/browser crashes with OOM.
 */
export default class StubTarget implements Target {
  name = 'stub'

  interactions: string[] = []

  batches: Message[][] = []

  subscription: Subscription = new Subscription(() => {
    this.interactions.push('unsubscribe')
  })

  run(_: Config, ri: RuntimeInfo) {
    this.interactions.push('run')
    this.subscription.add(ri.messages.subscribe(this._handle.bind(this)))
    return this.subscription
  }

  private _handle(batch: Message[]) {
    this.interactions.push(`batch with ${batch.length} messages`)
    this.batches.push(batch)
  }
}