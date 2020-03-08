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
/**
 *
 * @param {*} o A message object to digest structurally and deterministically.
 */
export function hexDigest(o: Record<string, any>): string {
  // https://github.com/Caligatio/jsSHA
  const hasher = new jsSHA('SHA-256', 'TEXT')
  const normalised = normalise(o)
  hasher.update(normalised)
  return hasher.getHash('HEX')
}