import Logary, { LogLevel, Target, Logger } from '../src'
import { EventMessage } from '../src/message'
import StubTarget from '../src/targets/stub'
import template from "../src/formatting/template"

const newLogary = (stub: StubTarget = new StubTarget()) => {
  return new Logary({
    serviceName: 'ABC',
    minLevel: LogLevel.debug,
    targets: [stub]
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

describe('Message', () => {

  const withLogger = (fn: (target: StubTarget, logger: Logger) => void) => {
    const target = new StubTarget()
    const logary = newLogary(target)

    const sub = logary.start()
    try {
      const logger = logary.getLogger('my component')

      fn(target, logger)
    }
    finally {
      sub.unsubscribe()
    }
  }

  test('attaches hash of message as the MessageId', () => {
    withLogger((target, logger) => {
      const start = Date.now()

      logger.info("Hello world")

      const m = target.messages[0]
      expect(m.id).toBeDefined()
      expect(m.timestamp).toBeGreaterThanOrEqual(start)
      expect(m.level).toEqual(LogLevel.info)
      expect(Object.keys(m.fields || {})).toEqual([])
      expect((m as EventMessage).event).toStrictEqual('Hello world')
      expect(m.name).toEqual(['ABC', 'my component'])
    })
  })

  test('logger.event: string, money, fields, context', () => {
    withLogger((target, logger) => {
      logger.event('Purchase made', {
        amount: 20,
        currency: 'SEK'
      }, {
        cssSelector: '[data-track=purchase-button]'
      }, {
        userId: '123'
      })

      const ms = target.messages

      const first = ms[0] as EventMessage

      expect(first.event).toBe('Purchase made')
      expect(first.monetaryValue).not.toBeNull()
      expect(first.monetaryValue!.amount).toBeCloseTo(20)
      expect(first.monetaryValue!.currency).toBe('SEK')
      expect(first.fields.cssSelector).toBe('[data-track=purchase-button]')
      expect(first.context).toEqual({ userId: '123' })
    })
  })

  test('logger.event: string, money, fields', () => {
    withLogger((target, logger) => {
      logger.event('Delete from shopping cart', {
        amount: -20,
        currency: 'SEK'
      }, {
        cssSelector: '[data-track=delete-button]',
        // this should probably be turned into a product of its own at some point (?):
        product: {
          id: '321',
          colour: 'red'
        }
      })

      const m = target.messages[0] as EventMessage
      expect(m.event).toBe('Delete from shopping cart')
      expect(m.fields.cssSelector).toBe('[data-track=delete-button]')
      expect(m.fields.product).toBeDefined()
      expect((m.fields.product as Record<string, any>).id).toBe('321')
      expect(m.context).toEqual({})
    })
  })

  // TODO: navigation event
  // TODO: unload event
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