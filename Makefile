.PHONY: clean build publish release

release: clean build test publish

test:
	yarn run test

clean:
	(cd packages/logary && rm -rf dist node_modules)
	(cd packages/logary-plugin-browser && rm -rf dist node_modules)
	(cd packages/logary-plugin-nextjs && rm -rf dist node_modules)
	(cd packages/logary-plugin-node && rm -rf dist node_modules)
	(cd packages/logary-plugin-react && rm -rf dist node_modules)

build:
	yarn lerna bootstrap
	yarn lerna link
	yarn lerna run build

publish:
	yarn lerna publish
