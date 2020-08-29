import '../utils/BigInt-JSON-patch'
import { KeyValue } from '../types'

function render(value: any) {
  if (value == null) return value

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function getIn(path: readonly string[], fromArgs: Record<string, any>): any {
  let p, cP, c = fromArgs, i = 0
  while ((p = path[i++]) != null && (c = c[p]) != null) cP = c
  return cP
}

export type Templated = {
  message: string;
  consumed: KeyValue[];
  remaining: KeyValue[]
};

export default function template(templ: string, args: Record<string, any> = {}) {
  const consumed: KeyValue[] = [], argsCopy = { ...args }

  const message = templ.replace(/\{([\w-.]+)\}/g, substr => {
    const key = substr.replace(/[}{]/g, ''),
      raw = key.indexOf('.') === -1 ? args[key] : getIn(key.split('.'), args)
    
    let value
    if ((value = render(raw)) != null) {
      consumed.push({ key, value })
      delete argsCopy[key]
      return value
    } else return key
  })

  const remaining = Object.keys(argsCopy).map(key => ({ key, value: argsCopy[key] }))

  return { message, consumed, remaining }
}