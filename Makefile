.PHONY: clean build publish release

release: clean build publish

clean:
	(cd packages/logary && rm -rf dist)
	(cd packages/logary-plugin-browser && rm -rf dist)
	(cd packages/logary-plugin-nextjs && rm -rf dist)
	(cd packages/logary-plugin-node && rm -rf dist)
	(cd packages/logary-plugin-react && rm -rf dist)

build:
	(cd packages/logary && yarn build)
	(cd packages/logary-plugin-browser && yarn build)
	(cd packages/logary-plugin-nextjs && yarn build)
	(cd packages/logary-plugin-node && yarn build)
	(cd packages/logary-plugin-react && yarn build)

publish:
	(cd packages/logary && yarn publish)
	(cd packages/logary-plugin-browser && yarn publish)
	(cd packages/logary-plugin-nextjs && yarn publish)
	(cd packages/logary-plugin-node && yarn publish)
	(cd packages/logary-plugin-react && yarn publish)
