# Logary JS



## Trying out the examples/building

    yarn
    yarn dev

## Trying an example

Do the above, and then:

    cd examples/with-nextjs
    yarn
    yarn dev

Open http://localhost:3000 in a browser.

## Publishing

    yarn run lerna publish    # https://github.com/lerna/lerna/pull/2450

    yarn pack #???

See https://yarnpkg.com/features/workspaces#publishing-workspaces


### Yarn 2 plugins

    yarn plugin import workspace-tools
    yarn plugin import interactive-tools
    yarn plugin import typescript

See https://github.com/yarnpkg/berry/tree/master/packages and
https://yarnpkg.com/advanced/migration for migration advice.

To use Yarn 2 with VS Code:

    yarn dlx @yarnpkg/pnpify --sdk vscode

## Links

- What's in [.gitignore for yarn?](https://stackoverflow.com/questions/60184159/yarn-v2-gitignore)
