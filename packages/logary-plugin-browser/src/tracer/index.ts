import Logary, { TracerModule, HasTracer } from "logary"
import { LogaryExporter } from "logary"

export default function create(logary: Logary): TracerModule & HasTracer {
  if (logary == null) throw new Error('Parameter "logary" is null or undefined; you need to pass in the Logary instance to the create function.')

  const loadedModule = require('./webTracer')

  const { provider } = loadedModule.default(new LogaryExporter(logary), logary)

  const name = logary.serviceName.join('.')

  const tracer = provider.getTracer(name, logary.serviceVersion)

  return { provider, tracer }
}