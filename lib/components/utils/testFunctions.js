"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isXML = isXML;
exports.xmlToJson = xmlToJson;
exports.isJson = isJson;
exports.csvToJson = csvToJson;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @return {boolean}
 */
function isXML(xmlStr) {
  let parseXml;

  if (typeof window.DOMParser !== "undefined") {
    parseXml = function (xmlStr) {
      return new window.DOMParser().parseFromString(xmlStr, "text/xml");
    };
  } else if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function (xmlStr) {
      let xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
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
  let obj = {};

  if (xml.nodeType === 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};

      for (let j = 0; j < xml.attributes.length; j += 1) {
        const attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    // text
    obj = xml.nodeValue;
  } // do children
  // If just one text node inside


  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
    obj = xml.childNodes[0].nodeValue;
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i += 1) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;

      if (typeof obj[nodeName] === 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === 'undefined') {
          const old = obj[nodeName];
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

function csvToJson(csv, delimiter = ',') {
  if (!(typeof csv === 'string' || csv instanceof String)) {
    console.error("CSV is not in string format. PLease provide csv in string format. format: ", typeof csv);
  }

  const [firstLine, ...lines] = csv.split('\n');
  return lines.map(line => firstLine.split(delimiter).reduce((curr, next, index) => _objectSpread(_objectSpread({}, curr), {}, {
    [next]: line.split(delimiter)[index]
  }), {}));
}