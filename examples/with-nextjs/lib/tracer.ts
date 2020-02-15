const loadedModule = typeof window === 'undefined' ? require('./serverTracer') : require('./webTracer')
export const tracer = loadedModule.default
export const provider = loadedModule.provider
export default loadedModule.default