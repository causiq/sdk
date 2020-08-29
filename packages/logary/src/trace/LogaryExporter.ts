import { ReadableSpan, SpanExporter } from "@opentelemetry/tracing"
import Logary, { Logger, LogLevel, SpanMessage} from ".."
import { ExportResult } from "@opentelemetry/core"

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

  shutdown(): void {
  }
}