import { Observable } from 'rxjs'
import { Config } from './config'
import { Message } from './message'

export default interface RuntimeInfo extends Omit<Config, 'serviceName'> {
  readonly serviceName: string[];
  readonly messages: Observable<Message>;
}