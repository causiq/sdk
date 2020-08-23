import { createContext, useContext } from "react"
import Logary, { getLogary } from '../../../dist'
import { Config } from "../../../dist"

export const LogaryProvider = createContext<Logary | null>(null)

export default function useLogary(config?: Config, instance?: Logary) {
  const ctx = useContext(LogaryProvider)
  return ctx || getLogary(config, instance)
}

export function useLogger(...name: string[]) {
  const { getLogger } = useLogary()
  return getLogger(...name)
}