BABEL = ./node_modules/.bin/babel
SRC = $(wildcard lib/*.js)

all: clean install test collect-coverage build

build: ; @echo 'Making build...'
	@mkdir -p node/
	@for path in $(SRC); do \
		file=`basename $$path`; \
		NODE_ENV=production BABEL_ENV=production $(BABEL) "lib/$$file" > "node/$$file"; \
	done

test: ; @echo 'Running tests...'
	@NODE_ENV=test ./node_modules/.bin/babel-node ./node_modules/.bin/_mocha test
	@if [ -z "${TRAVIS_NODE_VERSION}" ] || [ "${TRAVIS_NODE_VERSION}" = "node" ]; then \
		echo "Running eslint..."; NODE_ENV=test ./node_modules/.bin/babel-node ./node_modules/.bin/eslint lib test;\
	fi

install: ; @echo 'Installing packages...'
	@npm install

clean: ; @echo 'Cleaning up...'
	@rm -fr node

publish: ; @echo 'Publishing...'
	@make
	@git push --tags
	@npm publish

publish-beta: ; @echo 'Publishing beta...'
	@git push --tags
	@npm publish --tag beta

watch: ; @echo 'Running test watch task...'
	nodemon -w test -w lib -e js -x npm test

collect-coverage: ; @echo 'Collecting coverage data...'
	@NODE_ENV=test ./node_modules/.bin/babel-node ./node_modules/.bin/babel-istanbul cover ./node_modules/.bin/_mocha -- test

publish-coverage: ; @echo 'Publishing coverage data'
	@npm install codeclimate-test-reporter
	@$(MAKE) collect-coverage
	@codeclimate-test-reporter < coverage/lcov.info

.PHONY: all clean install test build
