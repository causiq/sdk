# Logary JS v6-beta

Logging and tracing library that ships into Logary Analytics from Browser and NodeJS servers.

Extra support for ReactJS and NextJS; see `packages/logary-plugin-*` — each plugin has an
README.md that aims to get you started.

## Getting started

[See the `logary` README.](https://github.com/logary/logary-js/tree/master/packages/logary) and then try an [example](#trying-an-example).

### Plugins

- [Browser](https://github.com/logary/logary-js/tree/master/packages/logary-plugin-browser)
- [NextJS](https://github.com/logary/logary-js/tree/master/packages/logary-plugin-nextjs)
- [Node](https://github.com/logary/logary-js/tree/master/packages/logary-plugin-node)
- [React](https://github.com/logary/logary-js/tree/master/packages/logary-plugin-react)

All code in this repo is runnable both server- and client-side.

## Trying an example

Do the above, and then:

    cd examples/with-nextjs-app
    yarn
    yarn dev

Open http://localhost:3000 in a browser.


## Building

    yarn
    yarn dev

You may also want to run `yarn lerna bootstrap`, `yarn lerna link` if you reinstall packages, 
and `yarn lerna run build` if you change the packages while testing an example.

## Publishing

Calling `make` on its own ensures all packages are fresh and link/compile properly.

    make
    yarn run lerna publish
