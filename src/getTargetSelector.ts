export default function getTargetSelector(event: any) {
  let target: Element | null = event.target
  if (target == null) return null

  const parts = []
  do {
    const i: string[] = []
    i.push(target.localName)
    // @ts-ignore .id may exist
    if (target.attributes.id != null) i.push(`#${target.attributes.id.value}`)
    for (const [_, e] of target.classList.entries()) i.push(`.${e}`)
    parts.push(i.join(''))

    // @ts-ignore .target exists
  } while ((target = target.parentElement) != null)

  return parts.reverse().join(' ')
}
