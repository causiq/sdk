import { Target } from '../types'
import { Message } from '../message'
import { Subscription } from 'rxjs'

export default class NullTarget implements Target {
  name = 'null-target'
  log(_: Message[]) {}
  run(): Subscription { return new Subscription() }
}