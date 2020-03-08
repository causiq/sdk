import { Subscription } from 'rxjs'
import { Config } from './config'
import RuntimeInfo from './runtimeInfo'

export interface Target {
  readonly name: string;
  run(config: Config, runtimeInfo: RuntimeInfo): Subscription
}