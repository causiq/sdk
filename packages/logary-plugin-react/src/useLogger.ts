import { Logger } from "logary"
import useLogary from "./useLogary"

export default function useLogger(...name: string[]): Logger {
  const { getLogger } = useLogary()
  return getLogger(...name)
}