# Logary JS — Next JS Plugin

A plugin for the popular Next JS framework.

    npm add @logary/plugin-nextjs

## Usage

For details, see [`./examples/with-nextjs`](https://github.com/logary/logary-js/tree/master/examples) in the repository.

In your `logary.ts`:

```typescript
import nextjs from '@logary/plugin-nextjs'
const logary = getLogary({ ... }) // configure targets and Logary Analytics ID here
nextjs(logary)
// more plugins here
export default logary
```

Make Logary available to your code from your `_app.tsx`:

```typescript
import logary from '../lib/logary'
// ... your App
export default withLogary(MyApp, { logary }) 
```

`withLogary` is also possible to apply selectively to your `Page` components.

You can now use Logary in your React components:

```typescript
function Button({ onClick, children }) {
  const { info } = useLogger('MyApp', 'Button')
  function handleClick(e: Event) {
    info('Made purchase', { amount: 20.3, currency: 'USD' })
    onClick(e)
  }
  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}
```
