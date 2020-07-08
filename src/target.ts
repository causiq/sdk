import { Runnable } from "./runnable"

export interface Target extends Runnable {
  readonly name: string;
}