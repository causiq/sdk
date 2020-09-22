# Logary JS — Browser Plugin

    [lang=bash]
    npm add @logary/plugin-browser

In your `logary.ts`:

```typescript
import browser from '@logary/plugin-browser'
const logary = getLogary({ ... }) // configure targets and Logary Analytics ID here
browser(logary)
// more plugins here
export default logary
```

## Features

- [x] Plugs into Logary JS without fuss
- [x] Tracks 'Page view' event as span
- [x] Tracks all window errors
- [x] Tracks the latency for all fetches on document load
- [x] Tracks all user clicks (element selector, element text)