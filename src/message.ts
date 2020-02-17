import { Templated } from './formatting/template';

export type Timestamp = number;
export enum LogLevel {
  Verbose = 1,
  Debug = 2,
  Info = 3,
  Warn = 4,
  Error = 5,
  Fatal = 6
}

export type Message = Readonly<{
  id?: string;
  timestamp: Timestamp;
  level: LogLevel;
  value: string;
  templated: Templated;
  fields?: Record<string, any>;
}>;
