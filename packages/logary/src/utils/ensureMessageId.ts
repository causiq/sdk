import { hexDigest } from './hasher'
import { Message } from "../message"

export default function ensureMessageId<TMessage extends Message>(m: TMessage): TMessage {
  return { ...m, id: hexDigest(m) }
}