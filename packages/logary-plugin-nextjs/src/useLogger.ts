import useLogary from "./useLogary"

export default function useLogger(...name: string[]) {
  const { getLogger } = useLogary()
  return getLogger(...name)
}