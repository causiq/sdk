// @flow
import jsSHA from 'jssha';

function traverse(o: Object, state: string, func: (string, string, any) => string) {
  //console.log('traverse on object', JSON.stringify(o), 'state', JSON.stringify(state));
  return Object.keys(o).
    sort().
    reduce((currState, key) => {
      if (o[key] != null && typeof o[key] === "object") {
        return traverse(o[key], currState, func);
      } else {
        return func.apply(this, [currState, key, o[key]]);
      }
    }, state);
}
function normalise(o: Object): string {
  return traverse(
    o, '',
    (state, key, value) => {
      //console.log('####### state', JSON.stringify(state), 'key', key, 'value', value);
      return state + key + "\t" + value + "\n"
    }
  )
}
export function hexDigest(o: Object): string {
  // https://github.com/Caligatio/jsSHA
  const hasher = new jsSHA('SHA-256', 'TEXT'),
        normalised = normalise(o);
  hasher.update(normalised);
  return hasher.getHash('HEX');
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
export function compose(...funcs: any) {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  } else {
    // Alternative formulation with higher-order functions only.
    // return funcs.reduceRight((composed, f) => f(composed), x => x);
    const last = funcs[funcs.length - 1];
    const rest = funcs.slice(0, -1);
    return (...args: any) => rest.reduceRight((composed, f) => f(composed), last(...args));
  }
};

function mergeDeep(A, B, depth) {
  var forever = depth == null;
  for (var p in B) {
    if (B[p] !== null && typeof B[p] !== 'undefined' && B[p].constructor === Object && (forever || depth > 0)) {
      A[p] = mergeDeep(
        Object.hasOwnProperty.call(A, p) ? A[p] : {},
        B[p],
        forever ? null : depth - 1
      );
    }
    // we generally don't want 'undefined' values in our maps
    else if (typeof B[p] === 'undefined') {} // esline-disable-line no-empty
    else {
      A[p] = B[p];
    }
  }
  return A;
}

function mergeUnsafe(A, B) {
  return mergeDeep(A, B, 0);
}

export function merge(A, B, depth) {
  var Acopy = mergeDeep({}, A);
  return mergeDeep(Acopy, B, depth);
}
