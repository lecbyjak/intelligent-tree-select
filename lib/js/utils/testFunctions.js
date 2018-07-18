"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require("babel-runtime/helpers/extends");

var _extends4 = _interopRequireDefault(_extends3);

var _toArray2 = require("babel-runtime/helpers/toArray");

var _toArray3 = _interopRequireDefault(_toArray2);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

exports.isXML = isXML;
exports.xmlToJson = xmlToJson;
exports.isJson = isJson;
exports.csvToJson = csvToJson;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @return {boolean}
 */
function isXML(xmlStr) {
    var parseXml = void 0;

    if (typeof window.DOMParser !== "undefined") {
        parseXml = function parseXml(xmlStr) {
            return new window.DOMParser().parseFromString(xmlStr, "text/xml");
        };
    } else if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
        parseXml = function parseXml(xmlStr) {
            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    } else {
        return false;
    }

    try {
        parseXml(xmlStr);
    } catch (e) {
        return false;
    }
    return true;
}

function xmlToJson(xml) {
    // Create the return object
    var obj = {};

    if (xml.nodeType === 1) {
        // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj['@attributes'] = {};
            for (var j = 0; j < xml.attributes.length; j += 1) {
                var attribute = xml.attributes.item(j);
                obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) {
        // text
        obj = xml.nodeValue;
    }

    // do children
    // If just one text node inside
    if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
        obj = xml.childNodes[0].nodeValue;
    } else if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i += 1) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof obj[nodeName] === 'undefined') {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push === 'undefined') {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

/**
 * @return {boolean}
 */
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function csvToJson(csv) {
    var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ',';

    if (!(typeof csv === 'string' || csv instanceof String)) {
        console.error("CSV is not in string format. PLease provide csv in string format. format: ", typeof csv === "undefined" ? "undefined" : (0, _typeof3.default)(csv));
    }

    var _csv$split = csv.split('\n'),
        _csv$split2 = (0, _toArray3.default)(_csv$split),
        firstLine = _csv$split2[0],
        lines = _csv$split2.slice(1);

    return lines.map(function (line) {
        return firstLine.split(delimiter).reduce(function (curr, next, index) {
            return (0, _extends4.default)({}, curr, (0, _defineProperty3.default)({}, next, line.split(delimiter)[index]));
        }, {});
    });
}