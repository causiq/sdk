export default function prop(e: any, debug = false) {
  return (name: string, tx?: (x: any) => any) => {
    const value = e[name]

    if (value == null) return null

    if (tx != null && debug) {
      console.info('prop in:', value)
      const o = tx(value)
      console.info('prop out:', o)
      return o
    }

    if (tx != null) return tx(value)

    return value
  }
}
