import Logary from '..'
import MockTarget from './utils/mockTarget'
import { LogLevel } from '../message'

describe('interaction Logary', () => {
  let listener: MockTarget

  beforeEach(() => {
    listener = new MockTarget()
  })

  test('does not log below min level', () => {
    const subject = new Logary('min level test', [ listener ], LogLevel.Info)

    subject.debug('Should not log')
    subject.info('Should INDEED log')

    expect(listener.calledWith.length).toBe(1)
  })

  test('attaches hash of message as the MessageId', () => {
    const sut = new Logary("Test", [listener])

    sut.info("Hello world")

    expect(listener.calledWith[0].args[0][0].id).toBeDefined();
  });
})