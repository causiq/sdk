import getTimestamp from './time'
import { LogLevel, EventMessage, SpanMessage, Message } from "../message"

const known = new Set<keyof (EventMessage & SpanMessage)>([
  'type', 'id', 'timestamp', 'level',
  'name', 'fields', 'context',
  'monetaryValue',
  'error'
])

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

  // console.log('message.error', o.error, 'message.fields', o.fields, 'message', o)

  return {
    ...o,
    fields
  }
}

export default function adaptLogFunction(level: LogLevel, message: string, ...args: unknown[]): EventMessage {
  const timestamp = getTimestamp()

  const o: Record<string, any> =
    args != null && args.length !== 0 && typeof args[0] === 'object'
      ? getPartialMessage(args[0])
      : {}

  return {
    ...(new EventMessage(message, o.monetaryValue || null, o.error || null, level, timestamp, o.fields || {}, o.context || {}, o.name || [])),
    ...o,
    type: 'event',
  }
}