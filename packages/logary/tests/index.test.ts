import Logary, { LogLevel } from '../src'
import { EventMessage } from '../src/message'
import StubTarget from '../src/targets/stub'

const newLogary = (stub: StubTarget = new StubTarget()) => {
  return new Logary({
    serviceName: 'ABC',
    minLevel: LogLevel.debug,
    targets: [ stub ]
  })
}

describe('surface API', () => {
  test('new Logary', () => {
    const s = newLogary()
    expect(s.serviceName).toStrictEqual([ 'ABC' ])
    expect(s.minLevel).toStrictEqual(LogLevel.debug)
    expect(s.targets.length).toStrictEqual(1)
  })

  test('start, log and stop', () => {
    const st = new StubTarget()
    expect(st.interactions).toEqual([])

    const logary = newLogary(st)
    const sub = logary.start()

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
  })
})

describe('Message', () => {

  test('attaches hash of message as the MessageId', () => {
    const start = Date.now()
    const target = new StubTarget()
    const logary = newLogary(target)
    const sub = logary.start()
    const logger = logary.getLogger('my component')

    logger.info("Hello world")

    const m = target.messages[0]
    expect(m.id).toBeDefined()
    expect(m.timestamp).toBeGreaterThanOrEqual(start)
    expect(m.level).toEqual(LogLevel.info)
    expect(Object.keys(m.fields || {})).toEqual([])
    expect((m as EventMessage).event).toStrictEqual('Hello world')
    expect(m.name).toEqual([ 'ABC', 'my component' ])

    sub.unsubscribe()
  })

})