"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLabel = getLabel;
exports.hashCode = hashCode;
exports.isURL = isURL;
exports.sanitizeArray = sanitizeArray;

function getLabel(option, labelKey, getOptionLabel) {
  return getOptionLabel ? getOptionLabel(option) : option[labelKey];
}

function hashCode(str) {
  let h = 0;

  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }

  return h;
}

function isURL(str) {
  return str.startsWith("https://") || str.startsWith("http://");
}

function sanitizeArray(arr) {
  return arr ? Array.isArray(arr) ? arr : [arr] : [];
}