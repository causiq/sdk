import { LogLevel } from './message'
import { Target } from './target'

/**
 * Logary configuration.
 */
export interface Config {
  readonly accountId?: string;
  readonly serviceName: string | string[];
  readonly targets: Target[];
  readonly minLevel: LogLevel;
  readonly debug?: boolean;
}