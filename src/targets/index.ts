import { Message } from '../message'

export interface Target{
  log(messages: Message[]): void;
  shutdown(): void;
}