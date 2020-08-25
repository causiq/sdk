import { LogLevel, Message } from './message'
import { Logger as OTLogger, LogFunction } from '@opentelemetry/api'
import { EventFunction } from "./types"

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