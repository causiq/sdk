export default function stringify(ps: any | any[]): string {
  return Array.isArray(ps)
    ? ps.map(p => String(p)).join(',')
    : ps.constructor.name
}