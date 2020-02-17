import { Target } from '../../targets'
import { Message } from '../../message'

export default class MockTarget implements Target {
  private calls: ({ name: string; args: any[] })[] = []

  log(messages: Message[]): void {
    this.calls.push({
      name: 'log',
      args: [messages]
    })
  }

  shutdown(): void {
    this.calls.push({
      name: 'shutdown',
      args: []
    })
  }

  public get calledWith() {
    return this.calls
  }
}