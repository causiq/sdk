# Logary JS

This is the JavaScript logger for capturing errors in web browsers and reporting
them to [Logary](https://logary.github.io).

Logary is a free and open source logging framework. It's also a fully functional
JavaScript logging framework which is extremely open to extension, because it's
all composed from pure functions.

Sponsored by
[qvitoo – A.I. bookkeeping and Logary in production since many years](https://qvitoo.com/?utm_source=github&utm_campaign=logary).

## Installation

With NPM

    npm install logary --save

with Yarn

    yarn add logary

## How to use

``` javascript
import Logary, { build, /* send */ getLogger, defaultTarget, Message } from 'logary'
// Supply this for your own user
const user = { id: 'abc', name: 'A B', email: 'a.b@example.com' } 

// Where to send logs?
const target = defaultTarget; // OR:

// ALTERNATIVELY: You can have one of these globally per application.
// const filter = next => req => next(req); // No infrastructure/non-functional requirements on requests

// A CUSTOM TARGET (uncomment send, filter, above):
// const target = Targets.logaryService({
//   path: 'http://localhost:10001/i/logary',
//   send: send(), // OR:
//   send: filter(send())
// })

// This instance is configured for the example user:
// You can have one of these prepared when the user logs in, in the user state store.
const logary = Logary(user, target, "MyWebApp");

// With 'build' we get a "live" function that can send to a target/server, use it to log
// You can have one of these in each of your module "screens"/parents
const sendMessage = build(logary, getLogger(logary, "MyModule"))

// Send a message!
// You can have one of these whereever you need to track stuff!
sendMessage(Message.event("App started")).subscribe()
```

You can spawn Rutta server-side as a docker container, to ingest logs:

```bash
$ docker run -p 10001:10001 --rm -it haaf/rutta router --listener http 0.0.0.0:10001 json --target console://./

```

![logary-js-rutta](/Users/h/dev/voi-extras/logary-js/docs/logary-js-rutta.png)

You can choose between the different targets when forwarding the logs (see the main `logary` repo)

For details about the object model that you use to log, see https://github.com/logary/logary/blob/master/README.md#tutorial-and-things-around-message
