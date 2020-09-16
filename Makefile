all: build

build: .npm-installed
	node index.js

run: .npm-installed
	-node index.js --run

npm:
	npm install

.npm-installed: package-lock.json
	touch .npm-installed

package-lock.json: package.json
	npm install

package.json:

.PHONY: build

