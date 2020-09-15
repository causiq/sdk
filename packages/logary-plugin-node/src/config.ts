import { CookieParseOptions, CookieSerializeOptions } from "cookie"

export let serializeOptions: CookieSerializeOptions = {
  httpOnly: false,
  secure: false
}

export let parseOptions: CookieParseOptions = {}

/**
 * Customize how cookies are handled by passing on the CookieSerializeOptions
 * and CookieParseOptions from the 'cookie' npm package.
 */
export function init(
  sOpts?: CookieSerializeOptions | undefined,
  pOpts?: CookieParseOptions | undefined
) {
  const prevS = serializeOptions
  serializeOptions = {
    ...prevS,
    ...sOpts
  }

  const prevP = parseOptions
  parseOptions = {
    ...prevP,
    ...pOpts
  }
}
