import { EventMessage, LogLevel, Message, SpanMessage } from './message'
import { hexDigest } from './hasher'
import getTimestamp from './time'


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
  return {
    ...o,
    fields
  }
}

export function adaptLogFunction(level: LogLevel, message: string, ...args: unknown[]): EventMessage {
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


export function ensureName(name: string[]) {
  return <TMessage extends Message>(m: TMessage) => m.name == null || m.name.length === 0 ? { ...m, name } : m
}

export function ensureMessageId<TMessage extends Message>(m: TMessage): TMessage {
  if (m.id != null) return m
  return { ...m, id: hexDigest(m) }
}