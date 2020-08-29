import { KeyValue, Target } from '../types'
import { Message, EventMessage, SpanMessage } from '../message'
import { Config } from '../config'
import RuntimeInfo from '../runtimeInfo'

function consolePrintKVs(kvs: KeyValue[]) {
  for (let i = 0; i < kvs.length; i++) {
    const { key, value } = kvs[i]
    console.info(`${key}:`, value)
  }
}

function consolePrintEvent(message: EventMessage) {
  const msg = message.name.length === 0 ? message.templated.message : `[${message.name.join('.')}] ${message.templated.message}`
  // console.log('message', message)

  if (message.templated.remaining.length > 0) {
    console.groupCollapsed(msg)
    consolePrintKVs(message.templated.remaining)
    console.groupEnd()
  } else {
    if (message.level in console) {
      // @ts-ignore
      console[message.level](msg)
    } else {
      console.log(msg)
    }
  }
}

function consolePrint(message: Message) {
  switch (message.type) {
    case 'event':
      return consolePrintEvent(message)

    case 'span':
      // eslint-disable-next-line no-use-before-define
      return consolePrintSpan(message)
  }
}

function consolePrintSpan(span: SpanMessage) {
  const M = BigInt('1000000')
  console.group(span.label,
    span.finished != null
      ? Math.max(Number(span.finished/M), Number(span.started/M)) - Number(span.started / M)
      : 0, 'ms')

  const tags: KeyValue[] = Object.keys(span.attrs)
    .filter(k => k != null && k !== '')
    .filter(k => 'number|string|boolean'.indexOf(typeof span.attrs[k]) !== -1)
    .map(k => ({ key: k, value: span.attrs[k] }))

  consolePrintKVs(tags)

  if (span.events.length > 0) console.groupCollapsed('events')
  span.events.forEach(consolePrint)
  if (span.events.length > 0) console.groupEnd()

  // if (span.children.length > 0) console.groupCollapsed(`children`);
  // span.children.forEach(consolePrintSpan);
  // if (span.children.length > 0) console.groupEnd();

  // const hasBaggage = span.hasBaggage;
  // if (hasBaggage) console.groupCollapsed(`baggage`);
  // span.spanContext.iterBaggage((k, v) => {
  //   console.debug(`${k}: ${v}`);
  //   return true;
  // });
  // if (hasBaggage) console.groupEnd();

  console.groupEnd()
}


export default class ConsoleTarget implements Target {

  constructor(noWarn?: boolean) {
    this.noWarn = noWarn != null ? noWarn : false
  }

  private noWarn: boolean
  name = 'console'

  log(message: Message) {
    if (typeof window === 'undefined' && !this.noWarn) {
      console.warn(
        'Logging with the default ConsoleLogger server-side; consider using req.logger instead, to capture logs better'
      )
    }

    consolePrint(message)
  }

  run(_: Config, ri: RuntimeInfo) {
    return ri.messages.subscribe(this.log.bind(this))
  }
}