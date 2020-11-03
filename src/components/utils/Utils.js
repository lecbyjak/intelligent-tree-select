export function getLabel(option, labelKey, getOptionLabel) {
  return getOptionLabel ? getOptionLabel(option) : option[labelKey];
}
