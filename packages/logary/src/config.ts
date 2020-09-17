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
   * Logary Analytics App Id
   */
  readonly appId?: string;
  readonly serviceVersion?: string;
  readonly serviceName: string | string[];
  readonly minLevel: LogLevel;
  readonly debug?: boolean;

  readonly libraryVersion?: string;

  readonly targets: Target[];
}