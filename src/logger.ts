import { LogLevel, Message } from './message'
import { Logger as OTLogger, LogFunction } from '@opentelemetry/api'
import { Money } from "./money"

export type EventFunction = (event: string, monetaryValueOrError?: Money | Error, ...args: unknown[]) => void

interface LoggerEx extends Readonly<OTLogger> {
  readonly verbose: LogFunction;
  readonly fatal: LogFunction;
  readonly event: EventFunction;
}

/**
 * Base interface for Logging in Logary
 */
export interface Logger extends LoggerEx {
  readonly name: string[];
  log(level: LogLevel, ...messages: Message[]): void;
}
