import { createContext, useContext } from "react"
import Logary, { Config, getLogary } from "logary"

export const LogaryProvider = createContext<Logary | null>(null)

export default function useLogary(config?: Config, instance?: Logary) {
  const ctx = useContext(LogaryProvider)
  return ctx || getLogary(config, instance)
}