import '../utils/BigInt-JSON-patch'
import { KeyValue } from '../types'

function render(value: any) {
  if (value == null) return value

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

export type Templated = { message: string; consumed: KeyValue[]; remaining: KeyValue[] };

export default function template(templ: string, args: Record<string, any> = {}): Templated {
  const consumed: KeyValue[] = [],
    argsCopy = { ...args }
  const message = templ.replace(/\{([\w-]+)\}/g, substr => {
    const v = substr.replace(/[}{]/g, '')
    let value
    if ((value = render(args[v])) != null) {
      consumed.push({ key: v, value })
      delete argsCopy[v]
      return value
    } else return v
  })
  const remaining = Object.keys(argsCopy).map(key => ({ key, value: argsCopy[key] }))
  return { message, consumed, remaining }
}
