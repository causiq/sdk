import { EventFunction } from "../types"
import { EventMessage, LogLevel } from "../message"
import { isMoney } from "../money"
import { Returning } from "./returning"

const createEventMessage: Returning<EventFunction, EventMessage> = (...args: unknown[]): EventMessage => {
  if (typeof args[0] !== 'string') throw new Error("First parameter must be of type 'string'")

  // string => void
  if (args.length === 1) return new EventMessage(args[0])

  let fields = args[2] as Record<string, any> | undefined
  let context = args[3] as Record<string, any> | undefined

  // string, Error, fields?, context? => void
  if (args[1] instanceof Error) {
    return new EventMessage(args[0], null, args[1], LogLevel.error, null, fields, context)
  }

  // string, Money, fields?, context? => void
  if (isMoney(args[1])) {
    return new EventMessage(args[0], args[1], null, LogLevel.info, null, fields, context)
  }

  // string, fields?, context? => void
  fields = args[1] as Record<string, any> | undefined
  context = args[2] as Record<string, any> | undefined
  return new EventMessage(args[0], null, null, LogLevel.info, null, fields, context)
}

export default createEventMessage