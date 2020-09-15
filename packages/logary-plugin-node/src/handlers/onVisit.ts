import { IncomingMessage, OutgoingMessage } from "http"
import { parseCookies, setCookie } from 'logary/src/utils/cookies'
import uuid from 'uuid'
import { CookieName } from 'logary'
import * as config from '../config'
import * as d64 from '../utils/d64'

const encode = (uuidAsString: string) => d64.encode(uuid.parse(uuidAsString))
const decode = (idInBase64: string) => uuid.stringify(d64.decode(idInBase64))
const oneYear = (from = Date.now()) => new Date(from + 1000*60*60*24*365)

const setCookieComposed = (res: OutgoingMessage, value?: string) => {
  const computedValue = encode(value || uuid.v4())
  setCookie({ res }, CookieName, computedValue, {
    ...config.serializeOptions,
    expires: oneYear(),
  })
}

export default async function onVisit(req: IncomingMessage, res: OutgoingMessage) {
  const cookies = parseCookies({ req }, config.parseOptions)
  const uId = cookies[CookieName]

  // TODO: remove logs
  console.log('got cookies:', cookies)
  console.log('cookies[uid]:', uId)

  if (uId == null) { 
    setCookieComposed(res)
  }
  else {
    try {
      const value = decode(uId)
      setCookieComposed(res, value)
    }
    catch { 
      setCookieComposed(res)
    }
  }
  res.setHeader('content-type', 'text/plain; charset=utf-8')
}