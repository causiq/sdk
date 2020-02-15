import { KeyValue } from '../keyvalue'
import { Logger, SpanLogger } from '..'
import { Message, Timestamp, LogLevel } from '../message'
import { SpanContext, SpanOptions } from '@opentelemetry/api'
import { Span } from '..'
import template from '../formatting/template'
import codec from '../codecs/textMap'

function consolePrintKVs(kvs: KeyValue[]) {
  kvs.forEach(({ key, value }) => console.debug(`${key}:`, value))
}

function consolePrint(message: Message) {
  const templated = message.templated
  if (templated.remaining.length > 0) {
    console.groupCollapsed(templated.message)
    consolePrintKVs(templated.remaining)
    console.groupEnd()
  } else {
    if (message.level in console) {
      // @ts-ignore
      console[message.level](templated.message)
    }
    else console.log(templated.message)
  }
}

function consolePrintSpan(span: Span) {
  console.group(span.label, span.finished != null ? Math.max(span.finished, span.started) - span.started : 0, 'ms')

  const tags: KeyValue[] = Object.keys(span.tags)
    .filter(k => k != null && k !== '')
    .filter(k => 'number|string|boolean'.indexOf(typeof span.tags[k]) !== -1)
    .map(k => ({ key: k, value: span.tags[k] }))

  consolePrintKVs(tags)

  if (span.logs.length > 0) console.groupCollapsed(`logs`)
  span.logs.forEach(consolePrint)
  if (span.logs.length > 0) console.groupEnd()

  if (span.children.length > 0) console.groupCollapsed(`children`)
  span.children.forEach(consolePrintSpan)
  if (span.children.length > 0) console.groupEnd()

  const hasBaggage = span.hasBaggage
  if (hasBaggage) console.groupCollapsed(`baggage`)
  span.spanContext.iterBaggage((k, v) => {
    console.debug(`${k}: ${v}`)
    return true
  })
  if (hasBaggage) console.groupEnd()

  console.groupEnd()
}

// class TopSpan implements Span {
//   constructor(inner: Logger, label: string, options: SpanOptions = {}) {
//     super(inner, label, options)
//   }

//   finish(finishTime?: Timestamp) {
//     const logger = super.finish(finishTime)
//     consolePrintSpan(this)
//     return logger
//   }
// }

export default class ConsoleTarget {
  noWarn: boolean

  constructor(noWarn?: boolean) {
    this.noWarn = noWarn != null ? noWarn : false
  }

  _handle(level: LogLevel, value: string, fields?: Record<string, any>) {
    if (typeof window === 'undefined' && !this.noWarn) {
      console.warn('Logging with the default ConsoleLogger server-side; consider using req.logger instead, to capture logs better')
    }
    const templated = template(value, fields)
    consolePrint({ timestamp: Date.now(), value, templated, level })
  }

  debug(value: string, fields?: Record<string, any>) {
    this._handle('debug', value, fields)
  }

  info(value: string, fields?: Record<string, any>) {
    this._handle('info', value, fields)
  }

  error(value: string, fields?: Record<string, any>) {
    this._handle('error', value, fields)
  }
}