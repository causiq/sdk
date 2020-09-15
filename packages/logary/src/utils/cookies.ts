// From MIT licensed https://raw.githubusercontent.com/maticzav/nookies/master/src/index.ts
// Modified to be without dependencies on express/next, by using 'http' instead.
// Exposes identical API, as can be studied at
// https://github.com/maticzav/nookies#nookies-cookie-cookie-cookie

import * as http from 'http'
import * as cookie from 'cookie'
import * as setCookieParser from 'set-cookie-parser'
import { Cookie } from 'set-cookie-parser'

const isBrowser = () => typeof window !== 'undefined'

function hasSameProperties(a: any, b: any) {
  const aProps = Object.getOwnPropertyNames(a)
  const bProps = Object.getOwnPropertyNames(b)

  if (aProps.length !== bProps.length) {
    return false
  }

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i]

    if (a[propName] !== b[propName]) {
      return false
    }
  }

  return true
}

/**
 * Compare the cookie and return true if the cookies has equivalent
 * options and the cookies would be overwritten in the browser storage.
 *
 * @param a first Cookie for comparison
 * @param b second Cookie for comparison
 */
function areCookiesEqual(a: Cookie, b: Cookie) {
  let sameSiteSame = a.sameSite === b.sameSite
  if (typeof a.sameSite === 'string' && typeof b.sameSite === 'string') {
    sameSiteSame = a.sameSite.toLowerCase() === b.sameSite.toLowerCase()
  }
  return (
    hasSameProperties(
      { ...a, sameSite: undefined },
      { ...b, sameSite: undefined },
    ) && sameSiteSame
  )
}

/**
 * Create an instance of the Cookie interface
 *
 * @param name name of the Cookie
 * @param value value of the Cookie
 * @param options Cookie options
 */
function createCookie(
  name: string,
  value: string,
  options: cookie.CookieSerializeOptions,
): Cookie {
  let sameSite = options.sameSite
  if (sameSite === true) {
    sameSite = 'strict'
  }
  if (sameSite === undefined || sameSite === false) {
    sameSite = 'lax'
  }
  const cookieToSet = { ...options, sameSite: sameSite }
  delete cookieToSet.encode
  return {
    name: name,
    value: value,
    ...cookieToSet,
  }
}

/**
 *
 * Parses cookies.
 *
 * @param ctx
 * @param options
 */
export function parseCookies(
  ctx?:
    | { req: http.IncomingMessage }
    | null
    | undefined,
  options?: cookie.CookieParseOptions,
): Record<string, string> {
  if (ctx && ctx.req && ctx.req.headers && ctx.req.headers.cookie) {
    return cookie.parse(ctx.req.headers.cookie as string, options)
  }

  if (isBrowser()) {
    return cookie.parse(document.cookie, options)
  }

  return {}
}

/**
 *
 * Sets a cookie.
 *
 * @param ctx
 * @param name
 * @param value
 * @param options
 */
export function setCookie(
  ctx:
    | { res: http.OutgoingMessage }
    | null
    | undefined,
  name: string,
  value: string,
  options: cookie.CookieSerializeOptions,
): void {
  if (ctx && ctx.res && ctx.res.getHeader && ctx.res.setHeader) {
    let cookies = ctx.res.getHeader('Set-Cookie') || []

    if (typeof cookies === 'string') cookies = [cookies]
    if (typeof cookies === 'number') cookies = []

    const parsedCookies = setCookieParser.parse(cookies)

    const cookiesToSet: string[] = []
    parsedCookies.forEach((parsedCookie: Cookie) => {
      if (!areCookiesEqual(parsedCookie, createCookie(name, value, options))) {
        cookiesToSet.push(
          cookie.serialize(parsedCookie.name, parsedCookie.value, {
            ...(parsedCookie as cookie.CookieSerializeOptions),
          }),
        )
      }
    })

    cookiesToSet.push(cookie.serialize(name, value, options))
    if (!ctx.res.finished) {
      ctx.res.setHeader('Set-Cookie', cookiesToSet)
    }
  }

  if (isBrowser()) {
    if (options && options.httpOnly) {
      throw new Error('Can not set a httpOnly cookie in the browser.')
    }

    document.cookie = cookie.serialize(name, value, options)
  }
}

/**
 *
 * Destroys a cookie with a particular name.
 *
 * @param ctx
 * @param name
 * @param options
 */
export function destroyCookie(
  ctx:
    | { res: http.OutgoingMessage }
    | null
    | undefined,
  name: string,
  options?: cookie.CookieSerializeOptions,
): void {
  const opts = { ...(options || {}), maxAge: -1 }

  if (ctx && ctx.res && ctx.res.setHeader && ctx.res.getHeader) {
    let cookies = ctx.res.getHeader('Set-Cookie') || []

    if (typeof cookies === 'string') cookies = [cookies]
    if (typeof cookies === 'number') cookies = []

    cookies.push(cookie.serialize(name, '', opts))

    ctx.res.setHeader('Set-Cookie', cookies)
  }

  if (isBrowser()) {
    document.cookie = cookie.serialize(name, '', opts)
  }
}

export default {
  set: setCookie,
  get: parseCookies,
  destroy: destroyCookie,
}
