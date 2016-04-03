# Logary-JS

This is the JavaScript logger for capturing errors in web browsers and reporting
them to [Logary](https://logary.github.io).

Logary is a free and open source logging framework. It's also a fully functional
JavaScript logging framework which is extremely open to extension, because it's
all composed from pure functions.

## Installation

``` bash
npm install logary --save
```

## Examples

In `./examples/webpack` is a sample for how to include it with webpack and serve
using express.js:

``` javascript
import { default as Logary, Targets, getLogger, build } from 'logary';

// once per site/app
const target = Targets.logaryService({
    path: '/i/site/logary',
      serialise: Logary.createContent,
        send: m => /* IRL: ajax */ Promise.resolve('Sent to server!')
});

// save this in the app's context:
const logary = new Logary('example.com', target);

// in your module, or in your functions:
const logger = build(logary, getLogger(logary, 'MyModule.MySub'));

logger(Message.event('Initialised App'));
```


