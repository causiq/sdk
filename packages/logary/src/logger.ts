import { LogLevel, Message } from './message'
import { Logger as OTLogger, LogFunction, Tracer } from '@opentelemetry/api'
import { EventFunction, SetUserPropertyFunction, IdentifyUserFunction } from "./types"

interface LoggerEx extends Readonly<OTLogger> {
  readonly verbose: LogFunction;
  readonly fatal: LogFunction;
  readonly event: EventFunction;
  readonly setUserProperty: SetUserPropertyFunction;
  readonly identify: IdentifyUserFunction;
}

/**
 * Base interface for Logging in Logary
 */
export interface Logger extends LoggerEx, Tracer {
  readonly name: string[];
  log(level: LogLevel, ...messages: Message[]): void;
}
