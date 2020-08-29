import { TeardownLogic } from "rxjs"
import { Config } from "./config"
import RuntimeInfo from "./runtimeInfo"
import { Money } from "./money"

export interface EventFunction {
  /**
   * Log an event by name
   */
  (event: string): void;
  /**
   * Log an event by name, with fields and an optional context.
   */
  (event: string, fields: Record<string, any>, context?: Record<string, any>): void;
  /**
   * Log an event with a monetary value attached, optional fields, and optional context.
   */
  (event: string, monetaryValue: Money, fields?: Record<string, any>, context?: Record<string, any>): void;
  /**
   * Log an event with an attached Error instance.
   */
  (event: string, error: Error): void;
}

export interface IdentifyUserFunction {
  (prevUserId: string, nextUserId: string): void;
  (userId: string): void;
}

export interface SetUserPropertyFunction {
  (userId: string, key: string, value: unknown): void;
}

export interface Runnable {
  run(config: Config, runtimeInfo: RuntimeInfo): TeardownLogic
}

export interface Target extends Runnable {
  readonly name: string;
}

export type KeyValue = Readonly<{ key: string; value: any }>;

// TODO: verify against server structure

export type ErrorInfo = Readonly<{
  colNo?: string | number;
  lineNo?: string | number;
  fileName?: string;
  message?: string;
  stack?: string[];
  path?: string;
}>