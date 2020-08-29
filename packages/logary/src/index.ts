import { LogFunction } from '@opentelemetry/api'
import { Subscription } from 'rxjs'
import { Config } from "./config"
import Logary from './impl'
import { Logger } from './logger'
import { EventFunction, SetUserPropertyFunction, IdentifyUserFunction } from './types'
import { LogLevel } from './message'
import ConsoleTarget from './targets/console'

// https://www.typescriptlang.org/docs/handbook/modules.html
export default Logary
export { Config } from './config'
export { Logger } from './logger'
export { Message, LogaryMessage, EventMessage, SpanMessage, LogLevel } from './message'
export { default as money, isMoney, Money } from './money'
export * from './types'
export * from './features'
export * from './targets'
export * from './trace'

// what follows is the convenience API (every logging lib should be easy to get started with!)

let instance: Logary | null
let sub: Subscription | null
let logger: Logger | null

/**
 * Gets the global Logary instance, unless a user-supplied Logary was given.
 * @param userSupplied The Logary that was user-supplied; the caller owns this instance's lifetime
 */
export function getLogary(config?: Config, userSupplied?: Logary): Logary {
  if (userSupplied != null) {
    if (sub != null && userSupplied != instance) {
      sub.unsubscribe()
      sub = null
    }
    return instance = userSupplied
  }

  if (instance == null) {
    instance = new Logary(config || {
      minLevel: LogLevel.verbose,
      serviceName: 'Logary',
      targets: [
        new ConsoleTarget(),
      ]
    })
    sub = instance.start()
    logger = instance.getLogger()
  }

  return instance
}

function getLogger(): Logger {
  if (logger != null) return logger
  const logary = getLogary()
  return logger = logary.getLogger()
}

export const verbose: LogFunction = (m, ...args) => getLogger().verbose(m, ...args)
export const debug: LogFunction = (m, ...args) => getLogger().debug(m, ...args)
export const info: LogFunction = (m, ...args) => getLogger().info(m, ...args)
export const warn: LogFunction = (m, ...args) => getLogger().warn(m, ...args)
export const error: LogFunction = (m, ...args) => getLogger().error(m, ...args)
export const fatal: LogFunction = (m, ...args) => getLogger().fatal(m, ...args)

export const event: EventFunction = (...args: unknown[]) =>
  // @ts-ignore
  getLogger().event(...args)

export const identify: IdentifyUserFunction = (...args: unknown[]) =>
  // @ts-ignore
  getLogger().identify(...args)

export const setUserProperty: SetUserPropertyFunction = (...args: unknown[]) =>
  // @ts-ignore
  getLogger().setUserProperty(...args)