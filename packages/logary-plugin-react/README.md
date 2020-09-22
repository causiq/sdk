# Logary JS — React Plugin

A plugin for the popular React framework.

    npm add @logary/plugin-react

## Usage

For details, see [`./examples/with-nextjs`](https://github.com/logary/logary-js/tree/master/examples) in the repository.

In your `logary.ts`:

```typescript
import react from '@logary/plugin-react'
const logary = getLogary({ ... }) // configure targets and Logary Analytics ID here
react(logary)
// more plugins here
export default logary
```

You can now use the useLogary hook to get the Logary instance:

```typescript
import '../lib/logary' // ensure Logary is instantiated (best placed in App.tsx)

// now you can use the hooks in your components:
import { useLogary, useLogger } from '@logary/plugin-react'

export default function Button({ onClick, children }) {
  const { event } = useLogger('MyApp', 'Button')

  function handleClick(e: Event) {
    event('Made purchase', { amount: 20.3, currency: 'USD' })
    onClick(e)
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}
```