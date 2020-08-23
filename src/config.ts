import { LogLevel } from './message'
import { Target } from './types'

/**
 * Logary configuration.
 */
export interface Config {
  /**
   * Logary Analytics Account Id
   */
  readonly accountId?: string;
  readonly serviceVersion?: string;
  readonly serviceName: string | string[];
  readonly targets: Target[];
  readonly minLevel: LogLevel;
  readonly debug?: boolean;
}