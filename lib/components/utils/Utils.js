"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.arraysAreEqual = arraysAreEqual;
exports.getLabel = getLabel;
exports.hashCode = hashCode;
exports.isURL = isURL;
exports.monotonicAssign = monotonicAssign;
exports.sanitizeArray = sanitizeArray;
function getLabel(option, labelKey, getOptionLabel) {
  return getOptionLabel ? getOptionLabel(option) : option[labelKey];
}
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}
function isURL(str) {
  return str.startsWith("https://") || str.startsWith("http://");
}
function sanitizeArray(arr) {
  return arr ? (Array.isArray(arr) ? arr : [arr]) : [];
}
function arraysAreEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function monotonicAssign(target, ...sources) {
  // Note that this does not handle empty arrays, only attributes with explicitly undefined values
  return Object.assign(
    target,
    ...sources.map((x) => Object.fromEntries(Object.entries(x).filter(([key, value]) => value !== undefined)))
  );
}
