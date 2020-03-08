import { Target } from '../target'
import { Message } from '../message'
import { Subscription } from 'rxjs'

export default class NullTarget implements Target {
  name = 'null-target'
  log(batch: Message[]) {}
  run(): Subscription { return new Subscription() }
}