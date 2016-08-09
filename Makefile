all: build

build: node_modules
	node index.js

run: node_modules
	node index.js --run

node_modules: package.json
	npm install

.PHONY: build

