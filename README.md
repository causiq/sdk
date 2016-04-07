# Logary-JS

This is the JavaScript logger for capturing errors in web browsers and reporting
them to [Logary](https://logary.github.io).

Logary is a free and open source logging framework. It's also a fully functional
JavaScript logging framework which is extremely open to extension, because it's
all composed from pure functions.

Sponsored by
[qvitoo – A.I. bookkeeping and Logary in production since many years](https://qvitoo.com/?utm_source=github&utm_campaign=logary).

## Installation

``` bash
npm install logary --save
```

## Examples

In `./examples/webpack` is a sample for how to include it with webpack and serve
using express.js:

``` javascript
import {
  default as Logary,
  Targets,
  Message,
  ajax,
  getLogger,
  createContent, 
  build
} from 'logary';

// once per site/app
const target = Targets.logaryService({
  path: '/i/site/logary',
  serialise: createContent,
  send: ajax
});

// save this in the app's context:
const logary = new Logary('example.com', target);

// in your module, or in your functions, which ends the pipeline in the target
const logger = build(logary, getLogger(logary, 'MyModule.MySub'));

logger(Message.event('Initialised App'));
```

I also strongly recommend reading the
[unit tests](https://github.com/logary/logary-js/blob/master/test/unit/logary_test.js)
which accurately portray the API available.

### Features showcased

 - Target (second argument to c'tor) of signature: `Message -> Promise`.
 - Middleware (third argument to c'tor) of signature `msg:Message -> next:Middleware -> msg:Message`.
 - logger returns the Promise of the target
 - We'll console.log if you've missed configuring a target

