import template, { Templated } from './formatting/template'
import { hexDigest } from './hasher'

export type Timestamp = number

export enum LogLevel {
  verbose = 1,
  debug = 2,
  info = 3,
  warn = 4,
  error = 5,
  fatal = 6
}

export interface Message {
  readonly id?: string;
  readonly name: string[];
  readonly timestamp: Timestamp;
  readonly level: LogLevel;
  readonly value: string;
  readonly templated: Templated;
  readonly fields?: Record<string, any>;
}

export default class MessageImpl {
  constructor(
    public level: LogLevel,
    public value: string,
    public fields: Record<string, any> = {},
    public name: string[] = [],
    public timestamp: Timestamp = Date.now()) {
    this.templated = template(value, fields)
    this.id = hexDigest(this)
  }
  templated: Templated
  id: string
}