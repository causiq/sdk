import { LogLevel } from './message'
import { Target } from './types'

/**
 * The name of the cookie that contains the Logary or app-generated user id
 * as the single value.
 */
export const CookieName = 'uid'

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