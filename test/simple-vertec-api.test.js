'use strict';

var SimpleVertecApi = require('../lib/simple-vertec-api').SimpleVertecApi;
var expect = require('chai').expect;
var sinon = require('sinon-bluebird');

describe('SimpleVertecApi', function () {
    var api;
    var buildXmlSpy;

    beforeEach('setup', function () {
        api = new SimpleVertecApi('http://localhost', 'my-username', 'my-password');
        buildXmlSpy = sinon.spy(api, 'buildXml');
    });

    it('sets authentication data', function () {
        sinon.stub(api, 'doRequest');

        api.query('something', []);
        expect(buildXmlSpy.returnValues[0]).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>something</ocl></Selection></Query></Body></Envelope>');
    });

    it('does two requests with same auth data', function () {
        sinon.stub(api, 'doRequest');

        api.query('something', []);
        expect(buildXmlSpy.returnValues[0]).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>something</ocl></Selection></Query></Body></Envelope>');

        api.query('something else', []);
        expect(buildXmlSpy.returnValues[1]).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>something else</ocl></Selection></Query></Body></Envelope>');
    });

    it('throws an error if no select or fields arguments given', function () {
        sinon.stub(api, 'doRequest');
        var querySpy = sinon.spy(api, 'query');

        try {
            api.query();
        } catch (e) {
            // we only need the finally block
        } finally {
            expect(querySpy.exceptions).to.have.length(1);
            expect(querySpy.exceptions.shift().message).to.have.string('1438427960');
        }

        try {
            api.query('something');
        } catch (e) {
            // we only need the finally block
        } finally {
            expect(querySpy.exceptions).to.have.length(1);
            expect(querySpy.exceptions.shift().message).to.have.string('1438427960');
        }
    });

    it('throws an error if select or fields arguments are not valid', function () {
        sinon.stub(api, 'doRequest');
        var querySpy = sinon.spy(api, 'query');

        try {
            api.query('some select', { foo: 'bar' });
        } catch (e) {
            // we only need the finally block
        } finally {
            expect(querySpy.exceptions).to.have.length(1);
            expect(querySpy.exceptions.shift().message).to.have.string('1438428337');
        }

        try {
            api.query({ foo: 'bar' }, []);
        } catch (e) {
            // we only need the finally block
        } finally {
            expect(querySpy.exceptions).to.have.length(1);
            expect(querySpy.exceptions.shift().message).to.have.string('1438428337');
        }
    });

    it('sets members and expressions', function () {
        sinon.stub(api, 'doRequest');

        api.query('something', [
            'normal-field',
            {
                alias: 'foobar',
                ocl:   'object.field'
            }
        ]);
        expect(buildXmlSpy.returnValues[0]).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>something</ocl></Selection><Resultdef><member>normal-field</member><expression><alias>foobar</alias><ocl>object.field</ocl></expression></Resultdef></Query></Body></Envelope>');
    });

    it('throws an error on an unknown field config type', function () {
        sinon.stub(api, 'doRequest');

        try {
            api.query('something', [123]);
        } catch (e) {
            // we only need the finally block
        } finally {
            expect(buildXmlSpy.exceptions).to.have.length(1);
            expect(buildXmlSpy.exceptions[0].message).to.have.string('1437849815');
        }
    });

    it('accepts array as params argument in query', function () {
        sinon.stub(api, 'doRequest');

        api.query(
            'where-expression = ?',
            [123],
            [
                'normal-field',
                {
                    alias: 'foobar',
                    ocl:   'object.field'
                }
            ]
        );
        expect(buildXmlSpy.returnValues[0]).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>where-expression = 123</ocl></Selection><Resultdef><member>normal-field</member><expression><alias>foobar</alias><ocl>object.field</ocl></expression></Resultdef></Query></Body></Envelope>');
    });

    it('returns ? placeholder if more placeholders then params in array given', function () {
        sinon.stub(api, 'doRequest');

        api.query(
            'where-x-expression = ? and where-y-expression = ?',
            [123],
            [
                'normal-field',
                {
                    alias: 'foobar',
                    ocl:   'object.field'
                }
            ]
        );
        expect(buildXmlSpy.returnValues[0]).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>where-x-expression = 123 and where-y-expression = ?</ocl></Selection><Resultdef><member>normal-field</member><expression><alias>foobar</alias><ocl>object.field</ocl></expression></Resultdef></Query></Body></Envelope>');
    });

    it('accepts object as params argument in query', function () {
        sinon.stub(api, 'doRequest');

        api.query(
            'where-x-expression = :id and where-y-expression = :id',
            {
                id: 123
            },
            [
                'normal-field',
                {
                    alias: 'foobar',
                    ocl:   'object.field'
                }
            ]
        );
        expect(buildXmlSpy.returnValues[0]).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>where-x-expression = 123 and where-y-expression = 123</ocl></Selection><Resultdef><member>normal-field</member><expression><alias>foobar</alias><ocl>object.field</ocl></expression></Resultdef></Query></Body></Envelope>');
    });

    it('throws an error if named parameter does not exist in params object', function () {
        sinon.stub(api, 'doRequest');
        var querySpy = sinon.spy(api, 'query');

        try {
            api.query(
                'where-x-expression = :id and where-y-expression = :name',
                {
                    id: 123
                },
                ['foobar']);
        } catch (e) {
            // we only need the finally block
        } finally {
            expect(querySpy.exceptions).to.have.length(1);
            expect(querySpy.exceptions[0].message).to.have.string('1438415385');
        }
    });

    it('converts select parameter of type Date to special encodeDate format', function () {
        sinon.stub(api, 'doRequest');

        api.query(
            'where-x-expression = :id and where-y-expression = :today',
            {
                id:    123,
                today: new Date('2015-08-01')
            },
            ['foobar']
        );
        expect(buildXmlSpy.returnValues.shift()).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>where-x-expression = 123 and where-y-expression = encodeDate(2015,8,1)</ocl></Selection><Resultdef><member>foobar</member></Resultdef></Query></Body></Envelope>');

        api.query(
            'where-x-expression = ? and where-y-expression = ?',
            [
                123,
                new Date('2015-08-01')
            ],
            ['foobar']
        );
        expect(buildXmlSpy.returnValues.shift()).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>where-x-expression = 123 and where-y-expression = encodeDate(2015,8,1)</ocl></Selection><Resultdef><member>foobar</member></Resultdef></Query></Body></Envelope>');
    });

    it('accepts a string/number/date as param argument in query', function () {
        sinon.stub(api, 'doRequest');

        var select = 'where-x-expression = ?';
        var fields = [];

        var param = 123;
        api.query(select, param, fields);
        expect(buildXmlSpy.returnValues.shift()).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>where-x-expression = 123</ocl></Selection></Query></Body></Envelope>');

        param = 'foobar';
        api.query(select, param, fields);
        expect(buildXmlSpy.returnValues.shift()).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>where-x-expression = foobar</ocl></Selection></Query></Body></Envelope>');

        param = new Date('2015-08-01');
        api.query(select, param, fields);
        expect(buildXmlSpy.returnValues.shift()).to.equal('<Envelope><Header><BasicAuth><Name>my-username</Name><Password>my-password</Password></BasicAuth></Header><Body><Query><Selection><ocl>where-x-expression = encodeDate(2015,8,1)</ocl></Selection></Query></Body></Envelope>');
    });

    it('converts response to json and extracts useful content', function () {
        sinon.stub(api, 'request').resolves('<Envelope><Body><QueryResponse><Kontakt><objid>12345</objid><sprache>DE</sprache></Kontakt><Kontakt><objid>23456</objid><sprache>EN</sprache></Kontakt></QueryResponse></Body></Envelope>');

        return api.query('something', []).then(function (content) {
            expect(content.Kontakt.length).to.equal(2);
            expect(content.Kontakt[0].objid).to.equal('12345');
            expect(content.Kontakt[0].sprache).to.equal('DE');
            expect(content.Kontakt[1].objid).to.equal('23456');
            expect(content.Kontakt[1].sprache).to.equal('EN');
        });
    });

    it('converts fault messages from server', function () {
        sinon.stub(api, 'request').resolves('<Envelope><Body><Fault><faultcode>Client</faultcode></Fault></Body></Envelope>');

        return api.query('some faulty select', []).then(function (result) {
            throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
        }, function (result) {
            expect(result).to.include.keys('Fault');
        });
    });
});
