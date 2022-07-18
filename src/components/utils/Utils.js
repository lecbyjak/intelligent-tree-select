export function getLabel(option, labelKey, getOptionLabel) {
  return getOptionLabel ? getOptionLabel(option) : option[labelKey];
}

export function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

export function isURL(str) {
  return str.startsWith("https://") || str.startsWith("http://");
}

export function sanitizeArray(arr) {
  return arr ? (Array.isArray(arr) ? arr : [arr]) : [];
}
