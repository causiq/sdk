import { Message } from "../message"

export default function ensureName(name: string[]) {
  return <TMessage extends Message>(m: TMessage) =>
    m.name == null || m.name.length === 0 ? { ...m, name } : m
}