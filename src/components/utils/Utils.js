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

export function arraysAreEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function monotonicAssign(target, ...sources) {
  // Note that this does not handle empty arrays, only attributes with explicitly undefined values
  return Object.assign(
    target,
    ...sources.map((x) => Object.fromEntries(Object.entries(x).filter(([key, value]) => value !== undefined)))
  );
}

/**
 * Compares lists of options by comparing the specified {@code valueKey}s
 *
 * @param a first option list
 * @param b second option list
 * @param valueKey the key in option objects to compare
 * @returns {boolean} {@code true} if both lists contain options with matching values of {@code valueKey} in the same order
 */
export function optionListsAreEqual(a, b, valueKey) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    const keyA = a[i]?.[valueKey] ?? a[i];
    const keyB = b[i]?.[valueKey] ?? b[i];
    if (keyA !== keyB) return false;
  }
  return true;
}

/**
 * Logs the given error message with additional objects and returns new error with the given message.
 *
 * @param message message to log and from which {@link Error} should be created
 * @param toLog objects that should be logged
 * @returns {Error} created error with the given message
 */
export function logAndError(message, ...toLog) {
  console.error(message, ...toLog);
  return new Error(message);
}

/**
 * Tries to extract the value from the given option
 *
 * @param option {string|Object|null} The option, possibly the value itself
 * @param valueKey {string} the key in the option object storing the value
 * @return {string|null} the resolved value or null
 */
export function getOptionId(option, valueKey) {
  if (option == null) {
    return null;
  }
  if (typeof option === "string") {
    return option;
  }
  return typeof option[valueKey] === "string" ? option[valueKey] : null;
}
