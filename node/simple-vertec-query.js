'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SimpleVertecQuery = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Simple Vertec Query
 *
 * @return {object} SimpleVertecQuery
 */
var SimpleVertecQuery = exports.SimpleVertecQuery = function () {
    _createClass(SimpleVertecQuery, null, [{
        key: 'setApi',

        /**
         * Sets global api for every instance
         *
         * @param {SimpleVertecApi} api An instance of SimpleVertecApi
         *
         * @return {void}
         */
        value: function setApi(api) {
            this.api = api;
        }

        /**
         * Sets global cache instance of memcached for every instance
         *
         * @param {memcached} cache An instance of memcached
         *
         * @return {void}
         */

    }, {
        key: 'setMemcached',
        value: function setMemcached(cache) {
            this.cache = cache;
        }

        /**
         * Sets global app cache key for every instance
         *
         * @param {string} appCacheKey App cache key
         *
         * @return {void}
         */

    }, {
        key: 'setAppCacheKey',
        value: function setAppCacheKey(appCacheKey) {
            this.appCacheKey = appCacheKey;
        }

        /**
         * Constructor
         *
         * Sets default properties and optionally overwrites them
         *
         * @param {object} overwriteOptions Overwrite options
         *
         * @return {object} SimpleVertecQuery
         */

    }]);

    function SimpleVertecQuery(overwriteOptions) {
        _classCallCheck(this, SimpleVertecQuery);

        this.options = {
            query: {},
            params: [],
            fields: [],

            cacheKey: null,
            cacheTTL: 0,
            cacheGraceTime: 0,

            transformer: [],
            propertyFilter: null,
            rootKey: 'data',

            useParallelMode: false
        };

        _lodash2.default.extend(this.options, _lodash2.default.cloneDeep(overwriteOptions));
    }

    /**
     * Finds one or many ids
     *
     * @param {number[]} ids One id or an array of ids
     *
     * @return {object} SimpleVertecQuery
     */


    _createClass(SimpleVertecQuery, [{
        key: 'findById',
        value: function findById(ids) {
            this.options.query.objref = ids;

            return this;
        }

        /**
         * Adds ocl expression to select
         *
         * @param {string} ocl Ocl expression
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'whereOcl',
        value: function whereOcl(ocl) {
            this.options.query.ocl = ocl;

            return this;
        }

        /**
         * Adds sql where expression to select
         *
         * @param {string} sql Sql where expression
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'whereSql',
        value: function whereSql(sql) {
            this.options.query.sqlwhere = sql;

            return this;
        }

        /**
         * Adds order expression
         *
         * @param {string} order Order expression
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'orderBy',
        value: function orderBy(order) {
            this.options.query.sqlorder = order;

            return this;
        }

        /**
         * Adds param value for injecting into fields (only as object) and select expressions
         *
         * @param {mixed} value Parameter
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'addParam',
        value: function addParam(value) {
            if (!_lodash2.default.isPlainObject(value)) {
                this.options.params.push(value);
            }

            if (_lodash2.default.isPlainObject(value)) {
                this.options.params = _lodash2.default.extend({}, this.options.params, value);
            }

            return this;
        }

        /**
         * Adds param values for injecting into fields (only as object) and select expressions
         *
         * Either the first argument is an array containing parameters
         * or every every argument is an parameter
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'addParams',
        value: function addParams() {
            var _options$params;

            (_options$params = this.options.params).push.apply(_options$params, arguments);

            return this;
        }

        /**
         * Adds one field to field array
         *
         * @param {string|object} value Either a string with the field or an object containing ocl and alias expressions
         * @param {string} alias Optional alias string if value is a string containing an ocl expression
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'addField',
        value: function addField(value, alias) {
            var newField = _lodash2.default.isUndefined(alias) || _lodash2.default.isPlainObject(value) ? value : { ocl: value, alias: alias };

            this.options.fields.push(newField);

            return this;
        }

        /**
         * Adds multiple fields to field array
         *
         * Either the first argument is an array containing fields
         * or every every argument (either a string or object) is a field
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'addFields',
        value: function addFields() {
            var _options$fields;

            var args = _lodash2.default.isArray(arguments[0]) ? arguments[0] : arguments;

            (_options$fields = this.options.fields).push.apply(_options$fields, _toConsumableArray(args));

            return this;
        }

        /**
         * Sets cache duration time in seconds and thus activates caching
         *
         * @param {number} seconds Seconds for item to be in cache
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'setCacheTTL',
        value: function setCacheTTL(seconds) {
            this.options.cacheTTL = seconds;

            return this;
        }

        /**
         * Additional grace seconds for item to remain in cache while it's getting renewed
         *
         * @param {number} seconds Seconds for item to be additionally in cache
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'setCacheGraceTime',
        value: function setCacheGraceTime(seconds) {
            this.options.cacheGraceTime = seconds;

            return this;
        }

        /**
         * Sets optional cache key for that cache entry
         *
         * If no cache key for that select defined a md5 hash of the whole request xml will be used
         *
         * @param {string} value Item cache key
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'setCacheKey',
        value: function setCacheKey(value) {
            this.options.cacheKey = value;

            return this;
        }

        /**
         * Adds a transformer function which will be called after a request returns a response
         *
         * Each transformer closure should return the transformed value
         *
         * @param {function} transformer Transformer function
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'addTransformer',
        value: function addTransformer(transformer) {
            this.options.transformer.push(transformer);

            return this;
        }

        /**
         * Sets a property filter which extracts the result for the specific property
         *
         * @param {string} key Property key to extract
         * @param {boolean} toArray Optionally converts value to an array
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'filterProperty',
        value: function filterProperty(key) {
            var toArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            this.options.propertyFilter = { key: key, toArray: toArray };

            return this;
        }

        /**
         * Sets optional root key for data to be capsuled
         *
         * @param {string} newKey New root key
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'setRootKey',
        value: function setRootKey(newKey) {
            this.options.rootKey = newKey;

            return this;
        }

        /**
         * Zips together the properties of the property at path's position
         *
         * Wildcards using '*' are allowed too
         *
         * @param {string} path Path to the object property
         * @param {null|string} keyToCheck Uses key to check wether result is a valid object
         * @param {boolean} forceArray Forces path to become an array
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'zip',
        value: function zip(path) {
            var keyToCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var forceArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            this.addZipTransformer(path, keyToCheck, forceArray);

            return this;
        }

        /**
         * Toggles parallel fetching mode of multiple objrefs
         *
         * @param {boolean} value Sets parallel mode
         *
         * @return {object} SimpleVertecQuery
         */

    }, {
        key: 'inParallel',
        value: function inParallel() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this.options.useParallelMode = value;

            return this;
        }

        /**
         * Sends a request with all settings and returns response
         *
         * Optionally puts it into cache and does some transformation.
         * Optionally sends multiple requests with same options in parallel.
         *
         * Example: take a look at the README file
         *
         * @param {boolean} refresh Forces a new request
         *
         * @return {Promise} Promise for the request
         */

    }, {
        key: 'get',
        value: function get() {
            var _this = this;

            var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (this.options.useParallelMode && this.options.query.objref) {
                var ids = _lodash2.default.isArray(this.options.query.objref) ? _lodash2.default.clone(this.options.query.objref) : [this.options.query.objref];

                return _bluebird2.default.map(ids, function (id) {
                    return new SimpleVertecQuery(_this.options).inParallel(false).findById(id).get(refresh);
                });
            }

            return new _bluebird2.default(function (resolve, reject) {
                if (SimpleVertecQuery.cache && _this.options.cacheTTL > 0) {
                    var cacheKey = _this.getCacheKey();
                    var currentTime = new Date().getTime();

                    return SimpleVertecQuery.cache.get(cacheKey, function (err, cacheData) {
                        if (err) {
                            return reject(err);
                        }

                        if (!refresh && _lodash2.default.isPlainObject(cacheData) && !_lodash2.default.isEmpty(cacheData)) {
                            cacheData.meta.onGrace = cacheData.meta.softExpire > 0 && currentTime > cacheData.meta.softExpire;
                            cacheData.meta.refresh = false;

                            resolve(cacheData);

                            if (!cacheData.meta.onGrace) {
                                return;
                            }
                        }

                        _this.makeRequest().then(function (result) {
                            var cacheDuration = _this.options.cacheTTL + _this.options.cacheGraceTime;

                            result.meta = {
                                cacheDateTime: currentTime,
                                softExpire: currentTime + _this.options.cacheTTL * 1000,
                                onGrace: false
                            };

                            SimpleVertecQuery.cache.set(cacheKey, result, cacheDuration,
                            /* istanbul ignore next: makes no sense to test this */
                            function () {});

                            result.meta.refresh = refresh;

                            resolve(result);
                        }, function (err) {
                            reject(err);
                        });
                    });
                }

                _this.makeRequest().then(function (result) {
                    resolve(result);
                }, function (err) {
                    reject(err);
                });
            });
        }

        /**
         * Compiles cache key
         *
         * @private
         *
         * @return {string} Cache key
         */

    }, {
        key: 'getCacheKey',
        value: function getCacheKey() {
            var cacheKey = [SimpleVertecQuery.appCacheKey ? SimpleVertecQuery.appCacheKey : 'svq', this.options.cacheKey ? this.options.cacheKey : (0, _md2.default)(SimpleVertecQuery.api.buildSelectString(this.options.query, this.options.params, this.options.fields)), this.options.cacheTTL];

            // if only one id given which e.g. is used in parallel mode it should be included in cache key
            // otherwise the same cache key would be used for different ids
            if (this.options.cacheKey && _lodash2.default.isNumber(this.options.query.objref)) {
                cacheKey.push(this.options.query.objref);
            }

            return cacheKey.join('-');
        }

        /**
         * Makes the actual request and some optional transformations
         *
         * @private
         *
         * @return {Promise} The actual request
         */

    }, {
        key: 'makeRequest',
        value: function makeRequest() {
            var _this2 = this;

            var request = SimpleVertecQuery.api.select(this.options.query, this.options.params, this.options.fields);

            this.addFilterPropertiesTransformer();
            request = this.runThroughTransformers(request);

            return request.then(function (response) {
                var result = _defineProperty({}, _this2.options.rootKey, response);

                return result;
            });
        }

        /**
         * Adds an transformer if property filter defined
         *
         * @private
         *
         * @return {void}
         */

    }, {
        key: 'addFilterPropertiesTransformer',
        value: function addFilterPropertiesTransformer() {
            var _this3 = this;

            if (this.options.propertyFilter) {
                this.options.transformer.unshift(function (response) {
                    var newResponse = response[_this3.options.propertyFilter.key];

                    if (_this3.options.propertyFilter.toArray && !_lodash2.default.isArray(newResponse)) {
                        newResponse = newResponse ? [newResponse] : [];
                    }

                    return newResponse;
                });
            }
        }

        /**
         * Adds zip transformers if zip paths defined
         *
         * @param {string} path Path to property to zip
         * @param {null|string} keyToCheck Uses key to check wether result is a valid object
         * @param {boolean} forceArray Forces path to become an array
         *
         * @private
         *
         * @return {void}
         */

    }, {
        key: 'addZipTransformer',
        value: function addZipTransformer(path) {
            var _this4 = this;

            var keyToCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var forceArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            this.options.transformer.push(function (response) {
                var targetPaths = _this4.getTargetPaths(response, path);

                _lodash2.default.each(targetPaths, function (targetPath) {
                    var target = _lodash2.default.get(response, targetPath);

                    if (_lodash2.default.isPlainObject(target)) {
                        var keys = _lodash2.default.keys(target);

                        if (_lodash2.default.isArray(target[keys[0]])) {
                            target = _lodash2.default.zipWith.apply(_lodash2.default, _toConsumableArray(_lodash2.default.values(target)).concat([function () {
                                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                                    args[_key] = arguments[_key];
                                }

                                return _lodash2.default.zipObject(keys, args);
                            }]));
                        } else {
                            target = [target];
                        }

                        if (!_lodash2.default.isNull(keyToCheck) && (_lodash2.default.isNull(target[0][keyToCheck]) || _lodash2.default.isUndefined(target[0][keyToCheck]))) {
                            target = [];
                        }

                        _lodash2.default.set(response, targetPath, target);
                    } else if (!target && forceArray) {
                        _lodash2.default.set(response, targetPath, []);
                    }
                });

                return response;
            });
        }

        /**
         * Checks path for wildcards and resolves them to their keys
         *
         * @param {object} obj Response object
         * @param {string} path Path
         *
         * @private
         *
         * @return {array} Array with expanded target paths
         */

    }, {
        key: 'getTargetPaths',
        value: function getTargetPaths(obj, path) {
            var targetPaths = [path];

            var _loop = function _loop(i) {
                var targetPath = targetPaths[i];

                if (!targetPath.match(/\*/)) {
                    return 'continue';
                }

                var parts = _lodash2.default.toPath(targetPath);
                var currentPath = '';

                _lodash2.default.each(parts, function (part, partIndex) {
                    // eslint-disable-line no-loop-func
                    if (part !== '*') {
                        currentPath += currentPath === '' ? part : '.' + part;
                    } else {
                        var keys = _lodash2.default.keys(currentPath === '' ? obj : _lodash2.default.get(obj, currentPath));

                        _lodash2.default.each(keys, function (key) {
                            var rest = parts.slice(partIndex + 1).join('.');
                            var newPath = (currentPath === '' ? key : currentPath + '.' + key) + (rest ? '.' + rest : '');
                            targetPaths.push(newPath);
                        });

                        targetPaths[i] = null;
                    }
                });
            };

            for (var i = 0; i < targetPaths.length; ++i) {
                var _ret = _loop(i);

                if (_ret === 'continue') continue;
            }

            targetPaths = _lodash2.default.reject(targetPaths, _lodash2.default.isNull);

            return targetPaths;
        }

        /**
         * Runs all transformers through the current request
         *
         * @param {Promise} request The current request
         *
         * @private
         *
         * @return {Promise} The actual request
         */

    }, {
        key: 'runThroughTransformers',
        value: function runThroughTransformers(request) {
            _lodash2.default.each(this.options.transformer, function (transformer) {
                request = request.then(transformer);
            });

            return request;
        }
    }]);

    return SimpleVertecQuery;
}();

