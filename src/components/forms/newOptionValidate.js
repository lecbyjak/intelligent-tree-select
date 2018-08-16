const validateLengthMin5 = (value) => {
  return !value || value.length < 5
    ? 'Field must be at least five characters'
    : null;
};

const validateLengthMin3 = (value) => {
  return !value || value.length < 3
    ? 'Field must be at least three characters'
    : null;
};

const validateNotSameAsParent = (value, values) => {
  if (values.parentOption) {
    for (let i = 0; i < value.length; i++) {
      if (isEquivalent(value[i], values.parentOption)) {
        return 'Child option cannot be same as parent option'
      }
    }
  }
  return null;
};

function isEquivalent(a, b) {
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length !== bProps.length) {
    return false;
  }

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i];

    // If values of same property are not equal,
    // objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
}


export {validateLengthMin3, validateLengthMin5, validateNotSameAsParent}
