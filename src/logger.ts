import { Logger as OTLogger  } from '@opentelemetry/api'
import { LogLevel, Message } from './message';

/**
 * Base interface for Logging in Logary
 */
export interface Logger extends OTLogger {
  name: string;
  log(level: LogLevel, message: Message): void;
}
