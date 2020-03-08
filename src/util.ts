import { Message, LogLevel } from './message'
import template from './formatting/template'

const known = new Set<keyof Message>([ 'timestamp', 'level', 'value', 'templated', 'fields'])

function getPartialMessage(thing?: object | null): Partial<Message> {
  const fields = {}
  const o: Partial<Message> = {}

  if (thing == null) return { fields }

  for (const k of Object.keys(thing)) {
    if (Object.prototype.hasOwnProperty.call(thing, k)) {
      if (known.has(k as keyof Message)) {
        // @ts-ignore
        o[k] = thing[k]
      } else {
        // @ts-ignore
        fields[k] = thing[k]
      }
    }
  }
  return {
    ...o,
    fields
  }
}

export function adaptLogFunction(level: LogLevel, message: string, ...args: unknown[]): Message {
  const timestamp = Date.now()

  const o =
    args != null && args.length !== 0 && typeof args[0] === 'object'
      ? getPartialMessage(args[0])
      : {}

  const intermediate = {
    value: message,
    timestamp,
    level,
    name: [],
    fields: {},
    ...o
  }

  return {
    ...intermediate,
    templated: template(intermediate.value, intermediate.fields)
  }
}
