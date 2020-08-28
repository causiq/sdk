import jsSHA from "jssha"

export type HexDigest = string;

function traverse(o: Record<string, any>, state: string, func: (arg0: string, arg1: string, arg2: any) => string): any {
  //console.log('traverse on object', JSON.stringify(o), 'state', JSON.stringify(state));
  return Object.keys(o).sort().reduce((currState, key) => {
    if (o[key] != null && typeof o[key] === "object") {
      return traverse(o[key], currState, func)
    } else {
      // @ts-ignore
      return func.apply(this, [currState, key, o[key]])
    }
  }, state)
}
/**
 *
 * @param {*} o Object to return a string-normalisation of.
 */
function normalise(o: Record<string, any>): string {
  return traverse(o, '', (state, key, value) => {
    //console.log('####### state', JSON.stringify(state), 'key', key, 'value', value);
    return `${state + key  }\t${  value  }\n`
  })
}

function bufToB64(buffer: ArrayBuffer) {
  if (typeof window === 'undefined') {
    return Buffer.from(buffer).toString('base64')
  } else {
    let binary = ''
    const bytes = new Uint8Array( buffer )
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode( bytes[ i ] )
    }
    return window.btoa(binary)
  }
}

/**
 *
 * @param {*} o A message object to digest structurally and deterministically.
 */
export function hexDigest(o: Record<string, any>): string {
  // https://github.com/Caligatio/jsSHA
  const hasher = new jsSHA('SHA-256', 'TEXT')
  const normalised = normalise(o)
  hasher.update(normalised)
  const buf = hasher.getHash('ARRAYBUFFER')
  return bufToB64(buf.slice(0, 16))
}