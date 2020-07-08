import { TeardownLogic } from "rxjs"
import { Config } from "./config"
import RuntimeInfo from "./runtimeInfo"

export interface Runnable {
  run(config: Config, runtimeInfo: RuntimeInfo): TeardownLogic
}