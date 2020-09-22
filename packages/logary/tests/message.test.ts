import Logary, { LogLevel, Logger } from '../src'
import { EventMessage } from '../src/message'
import StubTarget from '../src/targets/stub'

const newLogary = (stub: StubTarget = new StubTarget()) => {
  return new Logary({
    serviceName: 'ABC',
    minLevel: LogLevel.debug,
    targets: [stub],
    appId: 'LA-1234567'
  })
}

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
      expect(first.context).toEqual({
        appId: 'LA-1234567',
        userId: '123'
      })
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
      expect(m.context).toEqual({
        appId: 'LA-1234567'
      })
    })
  })

  test('attaches appId', () => {
    withLogger((target, logger) => {
      logger.event('Worlds')

      const m = target.messages[0] as EventMessage
      expect(m.context).toHaveProperty('appId')
      expect(m.context.appId).toBe('LA-1234567')
    })
  })

  // TODO: navigation event
  // TODO: unload event
})