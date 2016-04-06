clean:
	@rm -rf build

build-js:
	@mkdir -p build
	@cp ./index.js ./build/polyglot.js
	@./node_modules/.bin/uglifyjs -o ./build/polyglot.min.js ./index.js
	@gzip -c ./build/polyglot.min.js > ./build/polyglot.min.js.gz

annotate:
	@./node_modules/.bin/docco ./index.js

build: clean build-js


.PHONY: clean build build-js annotate
