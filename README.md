# Logary-JS [![Build Status](https://circleci.com/gh/logary/logary-js.png?circle-token=TODO)](https://circleci.com/gh/logary/logary-js)

This is the JavaScript logger for capturing errors in web browsers and reporting them to [Logary](https://logary.github.io).

Logary is a free and open source logging framework. Most of the code in this repo was created by airbrake.io.

## Installation

``` bash
npm install logary-js --save-dev
```

## Setup

Notifier uses [standalone browserify build](http://www.forbeslindesay.co.uk/post/46324645400/standalone-browserify-builds) and can be used with:
- [RequireJS](examples/requirejs/app.js).
- [Global/Window](examples/legacy/app.js).

## Basic Usage

First you need to initialize notifier:

    var logary = new LogaryClient();

Or if you have a customer (recommended):

    var logary = new LogaryClient({ session: { principalId: 1234, tenantId: 4321 } })

The simplest method is to report errors directly:

``` js
try {
  // This will throw if the document has no head tag
  document.head.insertBefore(document.createElement("style"));
} catch(err) {
  logary.push(err);
  throw err;
}
```

Alternatively you can wrap any code which may throw errors using the client's `wrap` method:

    var startApp = function() {
      // This will throw if the document has no head tag.
      document.head.insertBefore(document.createElement("style"));
    }
    startApp = logary.wrap(startApp);

    // Any exceptions thrown in startApp will be reported to Logary.
    startApp();

## Advanced Usage

### Default Annotations

It's possible to annotate error notices with all sorts of useful information. Below, the various top-level configuration keys are listed, along with their effects.

You pass a value-map/config to the constructor of the client:

``` js
{
  data: Object,
  session: Object,
  context: Object
}
```

 * `data` adds data; key-value information, reported alongside all errors.
 * `session` adds session information reported alongside all errors.
 * `context` adds context information reported alongside all errors.
  This hash is reserved for logger and Logary backend will ignore unknown keys.

Additionally, much of this information can be added to captured errors at the time they're captured by supplying it in the object being reported.

``` js
try {
  startApp();
} catch (err) {
  logary.push({
    error:       err,
    data:        { param1: 'param1' },
    session:     { param2: 'param2' },
    context:     { component: 'boostrap' }
  });
  throw err;
}
```

### Error object

Instead of exception you can pass error object constructed manually. For example, `window.onerror` handler can look like:

    window.onerror = function(message, file, line) {
      logary.push({error: {message: message, fileName: file, lineNumber: line}});
    }

or if you're using WebPack or similar:

    var logary              = new LogaryClient({ session: { principalId: 1234, tenantId: 4321 } }),
        errorHandlerFactory = require('logary/lib/logary.onerror'),
        handleError         = errorHandlerFactory logary;

    window.onerror = handleError;

### Source map

In order to enable source map support you have to specify path to the source map file according to the [source map specification](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.lmz475t4mvbx). For example, logary.min.js has following line:

    //# sourceMappingURL=logary.min.map

### Filtering errors

There may be some errors thrown in your application that you're not interested in sending to Logary, such as errors thrown by 3rd-party libraries, or by browser extensions run by your users.

The Logary client makes it simple to ignore this chaff while still processing legitimate errors. Add filters to the notifier by providing filter functions to the `filters` key when creating the client. The client is state-less, so you can create many of them if you wish.

`logline -> bool` accepts the entire error logline to be sent to Logary, and provides access to the `context`, `environment`, `data`, and `session` values submitted with the logline, as well as the single-element `errors` array with its `backtrace` element and associated backtrace lines.

The return value of the filter function determines whether or not the error logline will be submitted.
  * If a falsey value is returned, the logline is suppressed.
  * If a truthy value is returned, the logline may be admissible for submission.

A logline must pass all provided filters to be submitted. You can add filters when you create a client.

    // Here we suppress the notice if the top-level `session` key
    // indicates the user is logged in as an admin
    var logary = new LogaryClient({
      filters: [function(logline) {
        // Suppress reports from admin sessions
        return !logline.session.admin;
      }]
    });

## Dev & Testing

### Initially

``` bash
npm install
```

### Unit Tests

``` bash
npm test
```

OR

``` bash
grunt test
```

### Integration Tests

``` bash
npm run integration-test
```

OR

``` bash
grunt karma
```

# License

MIT, see `LICENSE` in the source tree.