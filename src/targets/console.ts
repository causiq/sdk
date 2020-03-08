import { KeyValue } from '../keyvalue'
// import { Logger, SpanLogger } from '..';
import { Message } from '../message'
// import { SpanContext, SpanOptions } from '@opentelemetry/api';
// import { Span } from '..';
// import template from '../formatting/template';
// import codec from '../codecs/textMap';
import { Target } from '../target'
// import { Subscription } from 'rxjs';
import { Config } from '../config'
import RuntimeInfo from '../runtimeInfo'

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
    } else console.log(templated.message)
  }
}

// function consolePrintSpan(span: Span) {
//   console.group(span.label, span.finished != null ? Math.max(span.finished, span.started) - span.started : 0, 'ms');

//   const tags: KeyValue[] = Object.keys(span.tags)
//     .filter(k => k != null && k !== '')
//     .filter(k => 'number|string|boolean'.indexOf(typeof span.tags[k]) !== -1)
//     .map(k => ({ key: k, value: span.tags[k] }));

//   consolePrintKVs(tags);

//   if (span.logs.length > 0) console.groupCollapsed(`logs`);
//   span.logs.forEach(consolePrint);
//   if (span.logs.length > 0) console.groupEnd();

//   if (span.children.length > 0) console.groupCollapsed(`children`);
//   span.children.forEach(consolePrintSpan);
//   if (span.children.length > 0) console.groupEnd();

//   const hasBaggage = span.hasBaggage;
//   if (hasBaggage) console.groupCollapsed(`baggage`);
//   span.spanContext.iterBaggage((k, v) => {
//     console.debug(`${k}: ${v}`);
//     return true;
//   });
//   if (hasBaggage) console.groupEnd();

//   console.groupEnd();
// }

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

export default class ConsoleTarget implements Target {

  private noWarn: boolean

  name = 'console'

  constructor(noWarn?: boolean) {
    this.noWarn = noWarn != null ? noWarn : false
  }

  log(messages: Message[]) {
    if (typeof window === 'undefined' && !this.noWarn) {
      console.warn(
        'Logging with the default ConsoleLogger server-side; consider using req.logger instead, to capture logs better'
      )
    }

    messages.forEach(consolePrint)
  }

  run(_: Config, ri: RuntimeInfo) {
    return ri.messages.subscribe(this.log.bind(this))
  }
}