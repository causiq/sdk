import { Logger as OTLogger } from '@opentelemetry/api'
import { Logger } from './logger'
import { Message, LogLevel } from './message'

export class NoopLogger implements Logger, OTLogger {
  get name() { return "" }
  debug(value: string, ...args: unknown[]): void {}
  info(value: string, ...args: unknown[]): void {}
  error(value: string, ...args: unknown[]): void {}
  warn(value: string, ...args: unknown[]): void {}
  log(level: LogLevel, message: Message): void {}
}
