import Logary, { LogLevel } from '../src'
import { EventMessage } from '../src/message'
import StubTarget from '../src/targets/stub'
import template from "../src/formatting/template"

const newLogary = (stub: StubTarget = new StubTarget()) => {
  return new Logary({
    serviceName: 'ABC',
    minLevel: LogLevel.debug,
    targets: [stub],
    appId: 'LA-1234567'
  })
}

describe('surface API', () => {
  test('new Logary', () => {
    const s = newLogary()
    expect(s.serviceName).toStrictEqual(['ABC'])
    expect(s.minLevel).toStrictEqual(LogLevel.debug)
    expect(s.targets.length).toStrictEqual(1)
  })

  test('start, log and stop', () => {
    const st = new StubTarget()
    expect(st.interactions).toEqual([])

    const logary = newLogary(st)
    const sub = logary.start()

    try {
      const logger = logary.getLogger('my component')

      logger.info('Hello world')

      logger.warn('goodbye cruel world')
      logger.log(LogLevel.error,
        new EventMessage('oh hoy', null, null, LogLevel.error),
        new EventMessage('shutting down', null, null, LogLevel.fatal))

      sub.unsubscribe()

      expect(st.interactions).toEqual([
        'run',
        'received message',
        'received message',
        'received message',
        'received message',
        'unsubscribe'
      ])
    } finally {
      sub.unsubscribe()
    }
  })
})

describe('formatting', () => {
  test('template with nested object', () => {
    const subject = template("Hello {world.name}!", {
      world: {
        name: "Henrik"
      }
    })

    expect(subject.message).toBe('Hello Henrik!')
  })
})