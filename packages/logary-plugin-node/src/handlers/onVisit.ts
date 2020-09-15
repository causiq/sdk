import { IncomingMessage, OutgoingMessage } from "http"
import { parseCookies, setCookie } from 'logary/src/utils/cookies'
import { CookieName, createUserId } from 'logary'
import * as config from '../config'

const oneYear = (from = Date.now()) => new Date(from + 1000*60*60*24*365)

const setCookieComposed = (res: OutgoingMessage, value?: string) => {
  const computedValue = value || createUserId()
  setCookie({ res }, CookieName, computedValue, {
    ...config.serializeOptions,
    expires: oneYear(),
  })
}

export default async function onVisit(req: IncomingMessage, res: OutgoingMessage) {
  const cookies = parseCookies({ req }, config.parseOptions)
  const uId = cookies[CookieName]

  if (uId == null) { 
    setCookieComposed(res)
  }
  else {
    try {
      setCookieComposed(res, uId)
    }
    catch { 
      setCookieComposed(res)
    }
  }
  res.setHeader('content-type', 'text/plain; charset=utf-8')
}