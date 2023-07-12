/*
  Returns the result of a key press when an element has focus. If the focus did not change, returns
  an empty object. If the focus changed, returns an object containing data on the newly focused
  element.
*/

exports.getKeyNav = async (loc, key) => {
  // Focus the element and press the key.
  await loc.press(key);
  // Get data on the newly focused element.
  const focData = await loc.evaluate(oldFoc => {
    const newFoc = document.activeElement;
    // If it is unchanged:
    if (newFoc === oldFoc) {
      // Return this.
      return {};
    }
    // Otherwise, i.e. if it is changed:
    else {
      // Get more data on it.
      const allEls = Array.from(document.body.querySelectorAll('*'));
      const index = allEls.findIndex(newFoc);
      const {tagName} = newFoc;
      const attributes = {};
      for (const attr of newFoc.attributes) {
        attributes[attr.name] = attr.value;
      }
      return {
        index,
        tagName,
        attributes
      };
    }
  }, key);
  // Return the result.
  return focData;
};
