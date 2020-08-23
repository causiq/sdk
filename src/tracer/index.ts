import Logary from ".."
import { LogaryExporter } from "./LogaryExporter"
import { TracerModule, HasTracer } from "./types"

export default function create(logary: Logary): TracerModule & HasTracer {
  if (logary == null) throw new Error('Parameter "logary" is null or undefined; you need to pass in the Logary instance to the create function.')
  // console.log('Loading tracer, is server=', typeof window === 'undefined')

  // TODO: Strange error loading async_hooks in NodeJS: investigate further later
  // error - ../../node_modules/@opentelemetry/context-async-hooks/build/src/AsyncLocalStorageContextManager.js:20:0
  // Module not found: Can't resolve 'async_hooks
  // const loadedModule =
  //   typeof window === 'undefined'
  //     ? require('./serverTracer')
  //     : require('./webTracer')

  const loadedModule = require('./webTracer')

  const { provider } = loadedModule.default(new LogaryExporter(logary), logary)

  const name = logary.serviceName.join('.')

  const tracer = provider.getTracer(name, logary.serviceVersion)

  return { provider, tracer }
}