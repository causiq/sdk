export default function explode(p: undefined | null | string | string[]): string[] {
  if (p == null) return []
  return Array.isArray(p)
    ? p.map(x => x.toString())
    : typeof p === 'string'
      ? p.split(/\n/g)
      : [ String(p) ]
}
