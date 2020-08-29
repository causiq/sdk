# Logary JS 🦋

A library for unified logging, metrics and tracing.

    npm add logary

## Usage

See the `./examples` folder. Here is an example with NextJS:

```typescript
import { RuttaTarget, getLogary, LogLevel, ConsoleTarget } from 'logary'
import browser from '@logary/plugin-browser'
import nextjs from '@logary/plugin-nextjs'
import react from '@logary/plugin-react'

const instance = getLogary({
  minLevel: LogLevel.debug,
  serviceName: 'with-nextjs',
  targets: [
    new ConsoleTarget(),
    new RuttaTarget({ endpoint: 'https://i.logary.tech' })
  ],
  accountId: 'open-source',
  debug: false
})

browser(instance)
nextjs(instance)
react(instance)

export default instance
```