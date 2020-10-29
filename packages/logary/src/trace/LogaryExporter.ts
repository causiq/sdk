import { ReadableSpan, SpanExporter } from "@opentelemetry/tracing"
import { ExportResult } from "@opentelemetry/core"
import Logary from '../impl'
import { Logger } from '../logger'
import { LogLevel, SpanMessage } from '../message'

export default class LogaryExporter implements SpanExporter {
  constructor(logary: Logary) {
    this.logger = logary.getLogger('Logary')
  }

  logger: Logger

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    const msgs = spans.map(SpanMessage.ofReadableSpan)
    let max = LogLevel.info
    for (const m of msgs) max = m.level > max ? m.level : max
    this.logger.log(max, ...msgs)
    resultCallback(ExportResult.SUCCESS)
  }

  shutdown(): Promise<void> {
    return new Promise<void>(resolve => resolve())
  }
}