import { Templated } from "./formatting/template";

export type Timestamp = number
export type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export type Message = Readonly<{
  timestamp: Timestamp;
  level: LogLevel;
  value: string;
  templated: Templated;
  fields?: Record<string, any>;
}>