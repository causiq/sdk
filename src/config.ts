import { Target } from './target'
import { LogLevel } from './message'

/**
 * Logary configuration.
 */
export interface Config {
  readonly serviceName: string | string[];
  readonly targets: Target[];
  readonly minLevel: LogLevel;
}