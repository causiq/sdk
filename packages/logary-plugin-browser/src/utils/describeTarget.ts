import { Target } from "logary"

type TargetSelectorResult = Readonly<{
  text?: string;
  eventName?: string;
  cssSelector: string;
}>

function tryWriteEventName(target: Element, res: Record<string, any>): void {
  let attr: Attr | null = null
  if (
    // @ts-ignore .data-track may exist
    (attr = target.attributes['data-track']) != null
    && attr.value != null && attr.value !== ''
  ) {
    res['eventName'] = attr.value
  }
}

function getPartName(target: Element): string {
  const i: string[] = []
  i.push(target.localName)
  // @ts-ignore .id may exist
  if (target.attributes['id'] != null) i.push(`#${target.attributes.id.value}`)
  for (const [_, e] of target.classList.entries()) i.push(`.${e}`)
  return i.join('')
}

export default function describeTarget(event: any): TargetSelectorResult | null {
  let target: Element | null = event.target
  if (target == null) return null

  const res: Record<string, any> = {}

  // @ts-ignore Target may be Button or ..., which has innerText on it
  if ('innerText' in target && target.innerText != null && target.innerText !== '') {
    // @ts-ignore Target may be Button or ..., which has innerText on it
    res['text'] = target.innerText.substring(0, 50)
  }

  const cssSelector = []
  do {
    if (res['eventName'] == null) tryWriteEventName(target, res)
    cssSelector.push(getPartName(target))
  }
  while ((target = target.parentElement) != null)
  res['cssSelector'] = cssSelector.reverse().join(' ')
  return res as TargetSelectorResult
}
