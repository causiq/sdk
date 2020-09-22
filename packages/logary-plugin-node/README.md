# Logary JS — Node JS plugin

A plugin for NodeJS that intercepts usage of http/https by default

    npm add @logary/plugin-node

## Usage

In your `logary.ts`:

```typescript
import node from '@logary/plugin-node'
const logary = getLogary({ ... }) // configure targets and Logary Analytics ID here
node(logary)
// more plugins here
export default logary
```