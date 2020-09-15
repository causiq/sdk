import { IncomingMessage, OutgoingMessage } from "http"
import { destroyCookie } from 'logary/src/utils/cookies'
import { CookieName } from 'logary'

export default async function onForget(_req: IncomingMessage, res: OutgoingMessage) {
  destroyCookie({ res }, CookieName)
  res.setHeader('content-type', 'text/plain; charset=utf-8')
}