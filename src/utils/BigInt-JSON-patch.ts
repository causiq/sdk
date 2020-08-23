// @ts-ignore Let me, please https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
BigInt.prototype.toJSON = function BigIntToString() { return this.toString() }
export default {}