import { Buffer } from 'buffer'

const DefaultChars = '.PYFGCRLAOEUIDHTNSQJKXBMWVZ_pyfgcrlaoeuidhtnsqjkxbmwvz1234567890'
  .split('').sort().join('')

const codeToIndex = ((chars: string) => {
  if(chars.length !== 64) throw new Error('a base 64 encoding requires 64 chars')
  const b = Buffer.alloc(128)
  for(let i = 0; i < 64; i++) {
    const code = chars.charCodeAt(i)
    b[code] = i
  }
  return b
})(DefaultChars)

export function encode(data: ArrayLike<number>): string {
  const len = data.length
  let s = '', hang = 0

  for(let i = 0; i < len; i++) {
    const v = data[i]

    switch (i % 3) {
      case 0:
        s += DefaultChars[v >> 2]
        hang = (v & 3) << 4
        break
      case 1:
        s += DefaultChars[hang | v >> 4]
        hang = (v & 0xf) << 2
        break
      case 2:
        s += DefaultChars[hang | v >> 6]
        s += DefaultChars[v & 0x3f]
        hang = 0
        break
    }

  }
  if (len%3) s += DefaultChars[hang]
  return s

}

export function decode(str: string): Buffer {
  const len = str.length
  const b = Buffer.alloc(~~((len/4)*3))
  let j = 0, hang = 0

  for(let i = 0; i < len; i++) {
    const v = codeToIndex[str.charCodeAt(i)]

    switch (i % 4) {
      case 0:
        hang = v << 2
        break
      case 1:
        b[j++] = hang | v >> 4
        hang = (v << 4) & 0xff
        break
      case 2:
        b[j++] = hang | v >> 2
        hang = (v << 6) & 0xff
        break
      case 3:
        b[j++] = hang | v
        break
    }

  }
  return b
}