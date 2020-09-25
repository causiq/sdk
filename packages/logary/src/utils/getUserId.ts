import { IncomingMessage, OutgoingMessage } from 'http'
import { parseCookies, setCookie } from "./cookies"
import { CookieParseOptions, CookieSerializeOptions } from 'cookie'
import createUserId from "./createUserId"
import { CookieName } from "../config"

type Context = Readonly<{ req: IncomingMessage, res: OutgoingMessage }>

export default function getUserId(
  ctx?: Context,
  parseOptions?: CookieParseOptions,
  serializeOptions?: CookieSerializeOptions
) {
  const cookies = parseCookies(ctx, parseOptions)
  if (cookies[CookieName] != null) return cookies[CookieName]
  else {
    const created = createUserId()
    setCookie(ctx, CookieName, created, serializeOptions)
    return created
  }
}