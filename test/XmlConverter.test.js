import XmlConverter from '../lib/XmlConverter';
import {expect} from 'chai';

describe('XmlConverter', () => {
    it('converts an object into an xml string', function () {
        var obj = {
            'entries': {
                'entry': [
                    { 'value': 'Entry 1' },
                    { 'value': 'Entry 2' },
                    { 'value': 'Entry 3' }
                ]
            }
        };
        var xml = '<entries><entry><value>Entry 1</value></entry><entry><value>Entry 2</value></entry><entry><value>Entry 3</value></entry></entries>';
        var result = XmlConverter.toXml(obj);
        expect(result).to.equal(xml);
    });

    it('ignores an empty object', function () {
        var obj = {
            'entries': {
                'entry': [
                    { 'value': 'Entry 1' },
                    { 'value': 'Entry 2' },
                    { 'value': 'Entry 3' }
                ]
            },
            entries2:  {}
        };
        var xml = '<entries><entry><value>Entry 1</value></entry><entry><value>Entry 2</value></entry><entry><value>Entry 3</value></entry></entries>';
        var result = XmlConverter.toXml(obj);
        expect(result).to.equal(xml);
    });

    it('converts an arrays into an xml string', function () {
        var obj = {
            'entries': {
                'entry': [
                    'Entry 1',
                    'Entry 2',
                    'Entry 3'
                ]
            }
        };
        var xml = '<entries><entry>Entry 1</entry><entry>Entry 2</entry><entry>Entry 3</entry></entries>';
        var result = XmlConverter.toXml(obj);
        expect(result).to.equal(xml);
    });

    it('ignores an empty array', function () {
        var obj = {
            'entries': {
                'entry': [
                    'Entry 1',
                    'Entry 2',
                    'Entry 3'
                ]
            },
            entries2:  []
        };
        var xml = '<entries><entry>Entry 1</entry><entry>Entry 2</entry><entry>Entry 3</entry></entries>';
        var result = XmlConverter.toXml(obj);
        expect(result).to.equal(xml);
    });
});