import { IdentifyUserMessage } from "../message"
import { IdentifyUserFunction } from "../types"
import { Returning } from "./returning"

const createIdentifyMessage: Returning<IdentifyUserFunction, IdentifyUserMessage> = (currentUserId: string | null | undefined, ...args: unknown[]): IdentifyUserMessage => {
  if (args.length === 0 || typeof args[0] !== 'string') throw new Error('args.length === 0 || typeof args[0] !== string, which means an invalid call to the identify function, was made')
  if (args.length === 1 && currentUserId == null) throw new Error('userIdFallback parameter is null or undefined, but the call to identify only has a single userId supplied')
  if (args.length >= 2 && typeof args[1] !== 'string') throw new Error('args[0] was string, but args[1] was not.')
  if (args.length >= 2) return new IdentifyUserMessage(args[0], args[1] as string)
  else return new IdentifyUserMessage(currentUserId as string, args[1] as string) // as verified by the guards above
}

export default createIdentifyMessage