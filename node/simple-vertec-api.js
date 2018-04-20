'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SimpleVertecApi = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _simpleXmlConverter = require('simple-xml-converter');

var _simpleXmlConverter2 = _interopRequireDefault(_simpleXmlConverter);

var _simpleParameterInjector = require('simple-parameter-injector');

var _simpleParameterInjector2 = _interopRequireDefault(_simpleParameterInjector);

var _xmlDigester = require('xml-digester');

var _xmlDigester2 = _interopRequireDefault(_xmlDigester);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _traverse = require('traverse');

var _traverse2 = _interopRequireDefault(_traverse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var xmlDigesterLogger = _xmlDigester2.default._logger;
xmlDigesterLogger.level(xmlDigesterLogger.WARN_LEVEL);

/**
 * Credentials should be out of export scope
 */
var vertecXmlUrl = void 0;
var vertecAuthUrl = void 0;
var vertecUsername = void 0;
var vertecPassword = void 0;

/**
 * Simple Vertec Api
 *
 * @param {string} xmlUrl Your Vertec host url
 * @param {string} authUrl Your Vertec auth url
 * @param {string} username Your Vertec username
 * @param {string} password Your Vertec password
 * @param {boolean} verbose set true for some debugging data
 * @param {object|null} defaultRequestOptions Default options for request
 *
 * @return {object} SimpleVertecApi
 */

var SimpleVertecApi = exports.SimpleVertecApi = function () {
    function SimpleVertecApi(xmlUrl, authUrl, username, password, verbose, defaultRequestOptions) {
        _classCallCheck(this, SimpleVertecApi);

        // eslint-disable-line max-params
        vertecXmlUrl = xmlUrl;
        vertecAuthUrl = authUrl;
        vertecUsername = username;
        vertecPassword = password;
        this.verbose = verbose;
        this.defaultRequestOptions = defaultRequestOptions || {};

        this.request = require('requestretry');
        this.storedPromises = {};

        // start own garbage collector for stored promises
        setInterval(this.gcPromises, 100000);
    }

    /**
     * Custom garbage collector for stored but not pending promises anymore
     *
     * @private
     *
     * @return {void}
     */


    _createClass(SimpleVertecApi, [{
        key: 'gcPromises',
        value: function gcPromises() {
            var _this = this;

            _lodash2.default.each(this.storedPromises, function (promise, hash) {
                if (!promise.isPending()) {
                    delete _this.storedPromises[hash];
                }
            });
        }

        /**
         * Request retry strategy which analyses response
         * and determines wether a retry attempt should be mode or not
         *
         * @private
         *
         * @param {null|object} err Error object
         * @param {object} response Response object
         *
         * @return {boolean} Boolean determining wether a retry attempt should be made or not
         */

    }, {
        key: 'requestRetryStrategy',
        value: function requestRetryStrategy(err, response) {
            var check = err !== null || !_lodash2.default.isObject(response) || response.statusCode >= 400 || _lodash2.default.isString(response.body) && (/<html>/i.test(response.body) || /<fault>/i.test(response.body));

            if (check) {
                this.log(err, response);
            }

            return check;
        }

        /**
         * Select for fetching data
         *
         * Forwards parameter to the select build method
         *
         * Example: take a look at the README file
         *
         * @return {Promise} Promise for the request
         */

    }, {
        key: 'select',
        value: function select() {
            var _this2 = this;

            return this.buildSelectString.apply(this, arguments).then(function (xmlString) {
                return _this2.doStoredRequest(xmlString);
            });
        }

        /**
         * Multi Select for fetching data
         *
         * Example: take a look at the README file
         *
         * @param {array} queryArray An array of select() usable arguments
         *
         * @return {Promise} Promise for the request
         */

    }, {
        key: 'multiSelect',
        value: function multiSelect(queryArray) {
            var _this3 = this;

            if (!_lodash2.default.isArray(queryArray)) {
                throw new Error('[1453380632] no valid query array given');
            }

            return _bluebird2.default.map(queryArray, function (query) {
                return _this3.select.apply(_this3, _toConsumableArray(query));
            });
        }

        /**
         * Finds one or many ids
         *
         * First parameter is for one or multiple integer ids
         * If only 2 params given then the second param is the fields array
         * If 3 params given then the second param is the params array
         * and the third param is the fields array
         *
         * @return {Promise} Promise for the request
         */

    }, {
        key: 'findById',
        value: function findById() {
            arguments[0] = {
                objref: arguments[0]
            };

            return this.select.apply(this, arguments);
        }

        /**
         * Finds many ids doing parallel requests
         *
         * If only 2 params given then the second param is the fields array
         * If 3 params given then the second param is the params array
         * and the third param is the fields array
         *
         * @param {number[]} ids An array of ids
         *
         * @return {Promise} Promise for the result of all requests
         */

    }, {
        key: 'multiFindById',
        value: function multiFindById(ids) {
            var _this4 = this;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return _bluebird2.default.map(ids, function (id) {
                return _this4.select.apply(_this4, [{ objref: id }].concat(args));
            });
        }

        /**
         * Deletes one or many ids
         *
         * @param {number|number[]} ids One id or an array of ids
         *
         * @return {Promise} Promise for the request
         */

    }, {
        key: 'delete',
        value: function _delete(ids) {
            var _this5 = this;

            if (!_lodash2.default.isArray(ids)) {
                ids = [ids];
            }

            var deleteObject = this.buildDeleteBody(ids);

            return this.buildXml(deleteObject).then(function (xmlString) {
                return _this5.doStoredRequest(xmlString);
            });
        }

        /**
         * Saves (creates or updates) one or many new objects
         *
         * @return {Promise} Promise for the request
         */

    }, {
        key: 'save',
        value: function save() {
            var _this6 = this;

            var saveData = [];

            if (arguments.length === 1 && _lodash2.default.isArray(arguments[0])) {
                saveData = arguments[0];
            }

            if (arguments.length === 2) {
                saveData.push({
                    className: arguments[0],
                    data: arguments[1]
                });
            }

            if (saveData.length === 0) {
                throw new Error('[1439115447] No valid object data found');
            }

            var createObjects = {};
            var updateObjects = {};
            _lodash2.default.each(saveData, function (saveObject) {
                if (!_lodash2.default.isString(saveObject.className) || !_lodash2.default.isPlainObject(saveObject.data)) {
                    throw new Error('[1439114369] No valid save object data found');
                }

                var targetObject = saveObject.data.objref ? updateObjects : createObjects;

                if (!targetObject[saveObject.className]) {
                    targetObject[saveObject.className] = [];
                }

                targetObject[saveObject.className].push(saveObject.data);
            });

            var saveObject = this.buildSaveBody(createObjects, updateObjects);

            return this.buildXml(saveObject).then(function (xmlString) {
                return _this6.doStoredRequest(xmlString);
            });
        }

        /**
         * Builds an xml string for the select
         *
         * @return {string} XML String
         */

    }, {
        key: 'buildSelectString',
        value: function buildSelectString() {
            var selectObject = this.buildSelectObject.apply(this, arguments);

            return this.buildXml(selectObject);
        }

        /**
         * Builds select object for fetching data
         *
         * First parameter is query
         * If only 2 params given then the second param is the fields array
         * If 3 params given then the second param is the params array
         * and the third param is the fields array
         *
         * @private
         *
         * @return {Object} Object for the select xml building
         */

    }, {
        key: 'buildSelectObject',
        value: function buildSelectObject() {
            var query = arguments[0];
            var params = arguments.length === 3 ? arguments[1] : null;
            var fields = arguments.length === 3 ? arguments[2] : arguments[1];

            if (_lodash2.default.isUndefined(query) || !_lodash2.default.isString(query) && !_lodash2.default.isPlainObject(query)) {
                throw new Error('[1438428337] no valid query given');
            }

            if (!_lodash2.default.isPlainObject(query)) {
                query = {
                    ocl: query
                };
            }

            if (!_lodash2.default.isUndefined(fields) && !_lodash2.default.isArray(fields)) {
                throw new Error('[1449929652] no valid fields argument');
            }

            query = _simpleParameterInjector2.default.inject(query, params);

            if (_lodash2.default.isPlainObject(params)) {
                fields = _simpleParameterInjector2.default.inject(fields, params);
            }

            fields = this.convertFieldOptions(fields);

            return this.buildSelectBody(query, fields);
        }

        /**
         * Converts fields to proper XML ready format
         *
         * @private
         *
         * @param {array} fields Array of field definitions
         *
         * @return {array} Array of XML conversion ready fields
         */

    }, {
        key: 'convertFieldOptions',
        value: function convertFieldOptions(fields) {
            var fieldOptions = {
                member: [],
                expression: []
            };

            _lodash2.default.forEach(fields, function (field) {
                if (_lodash2.default.isString(field)) {
                    return fieldOptions.member.push(field);
                }

                if (_lodash2.default.isObject(field)) {
                    return fieldOptions.expression.push(field);
                }

                throw new Error('[1437849815] Unknown field type');
            });

            return fieldOptions;
        }

        /**
         * Builds the xml request string out of the body object
         *
         * @private
         *
         * @param {object} body The body object
         *
         * @return {Promise} Promise for the XML String
         */

    }, {
        key: 'buildXml',
        value: function buildXml(body) {
            var _this7 = this;

            return this.buildXmlHeader().then(function (header) {
                return _this7.buildXmlFromHeaderAndBody(header, body);
            });
        }

        /**
         * Builds the xml request string out of the header and body object
         *
         * @private
         *
         * @param {object} header The header object
         * @param {object} body The body object
         *
         * @return {string} The built XML String
         */

    }, {
        key: 'buildXmlFromHeaderAndBody',
        value: function buildXmlFromHeaderAndBody(header, body) {
            var contentObject = {
                Envelope: {
                    Header: {},
                    Body: {}
                }
            };

            _lodash2.default.extend(contentObject.Envelope.Header, header);
            _lodash2.default.extend(contentObject.Envelope.Body, body);

            var xmlString = _simpleXmlConverter2.default.toXml(contentObject, 4);

            return xmlString;
        }

        /**
         * Builds the auth part of the XML Request
         *
         * @private
         *
         * @return {Promise} Promise for the auth part of the XML request
         */

    }, {
        key: 'buildXmlHeader',
        value: function buildXmlHeader() {
            return this.getAuthToken().then(function (authToken) {
                return { BasicAuth: { Token: authToken } };
            });
        }

        /**
         * Gets the auth token from Vertec
         *
         * @private
         *
         * @return {Promise} Promise for the auth token
         */

    }, {
        key: 'getAuthToken',
        value: function getAuthToken() {
            if (this.authTokenPromise) {
                return this.authTokenPromise;
            }

            var requestOptions = {
                uri: vertecAuthUrl,
                method: 'POST',
                body: 'vertec_username=' + vertecUsername + '&password=' + vertecPassword
            };

            var request = require('requestretry');

            this.authTokenPromise = request(requestOptions).then(function (response) {
                return response.body;
            });

            return this.authTokenPromise;
        }

        /**
         * Builds the select request object out of ocl expression data
         *
         * @private
         *
         * @param {string|object} select The select expression
         * @param {array} fields The fields to be fetched
         *
         * @return {object} Select object
         */

    }, {
        key: 'buildSelectBody',
        value: function buildSelectBody(select, fields) {
            return {
                Query: {
                    Selection: select,
                    Resultdef: fields
                }
            };
        }

        /**
         * Builds the body part of the XML Request containing the delete cmds
         *
         * @private
         *
         * @param {array} ids Ids which should be deleted
         *
         * @return {object} Body part of the XML request
         */

    }, {
        key: 'buildDeleteBody',
        value: function buildDeleteBody(ids) {
            return {
                Delete: {
                    objref: ids
                }
            };
        }

        /**
         * Builds the body part of the XML Request containing the create cmds
         *
         * @private
         *
         * @param {array} createObjects An array of objects to create
         * @param {array} updateObjects An array of objects to update
         *
         * @return {object} Body part of the XML request
         */

    }, {
        key: 'buildSaveBody',
        value: function buildSaveBody(createObjects, updateObjects) {
            return {
                Create: createObjects,
                Update: updateObjects
            };
        }

        /**
         * Temporarily store request and return if still pending
         * thus avoiding multiple identical requests going to the server
         *
         * @private
         *
         * @param {string} xmlString The XML request string
         *
         * @return {Promise} Promise for the request
         */

    }, {
        key: 'doStoredRequest',
        value: function doStoredRequest(xmlString) {
            var hash = (0, _md2.default)(xmlString);

            if (this.storedPromises[hash] && this.storedPromises[hash].isPending()) {
                return this.storedPromises[hash];
            }

            var promise = this.storedPromises[hash] = this.doRequest(xmlString);

            return promise;
        }

        /**
         * Does the actual request
         *
         * @private
         *
         * @param {string} xmlString The XML request string
         *
         * @return {Promise} Promise for the request
         */

    }, {
        key: 'doRequest',
        value: function doRequest(xmlString) {
            var _this8 = this;

            var requestOptions = _lodash2.default.extend({
                uri: vertecXmlUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml'
                },
                body: xmlString,
                maxAttempts: 5,
                retryDelay: 100,
                retryStrategy: this.requestRetryStrategy.bind(this)
            }, this.defaultRequestOptions);

            this.log('sending request', xmlString);

            return new _bluebird2.default(function (resolve, reject) {
                _this8.request(requestOptions, function (err, response, xmlContent) {
                    if (err) {
                        _this8.log('request error', err);
                        return reject(err);
                    }

                    _this8.log('raw xml content', xmlContent);

                    if (xmlContent.match(/<html>/i)) {
                        _this8.log('request error', xmlContent);
                        var errorMessage = {
                            Error: {
                                faultstring: xmlContent.replace(/<[^>]*>?/gm, '').trim()
                            }
                        };
                        return reject(errorMessage);
                    }

                    var digester = _xmlDigester2.default.XmlDigester({});
                    digester.digest(xmlContent, function (err, jsonContent) {
                        if (err) {
                            _this8.log('convert error', err);
                            return reject(err);
                        }

                        _this8.log('raw json content', jsonContent);

                        if (xmlContent.match(/<fault>/i)) {
                            _this8.log('request fault', xmlContent);
                            return reject(jsonContent.Envelope.Body);
                        }

                        var firstKey = _lodash2.default.keys(jsonContent.Envelope.Body)[0];
                        var response = jsonContent.Envelope.Body[firstKey];

                        _this8.transformDotKeys(response);

                        return resolve(response);
                    });
                });
            });
        }

        /**
         * Traverses an object and splits
         *
         * @private
         *
         * @param {object} obj The target object
         *
         * @return {void}
         */

    }, {
        key: 'transformDotKeys',
        value: function transformDotKeys(obj) {
            (0, _traverse2.default)(obj).forEach(function (node) {
                if (this.key && _lodash2.default.size(this.key.match(/\./g)) > 0) {
                    var newPath = this.key.split('.');
                    var combinedPath = _lodash2.default.slice(this.path, 0, -1).concat(newPath);
                    (0, _traverse2.default)(obj).set(combinedPath, node);
                    this.remove();
                }
            });
        }

        /**
         * Custom log method
         *
         * @private
         *
         * @return {void}
         */

    }, {
        key: 'log',
        value: function log() {
            if (this.verbose === true) {
                var content = void 0;
                for (var i = 0; i < arguments.length; i++) {
                    /* istanbul ignore next: makes no sense to test this */
                    content = !_lodash2.default.isString(arguments[i]) ? JSON.stringify(arguments[i], null, 4) : arguments[i];
                    /* istanbul ignore next: makes no sense to test this */
                    content = _lodash2.default.isString(content) ? content.replace(vertecPassword, 'xxxxxxxxxx') : content;

                    console.log(content); // eslint-disable-line no-console
                }
            }
        }
    }]);

    return SimpleVertecApi;
}();

