/*
  Returns the index of the newly focused member of a group of elements defined by a locator after
  a member of the group is focused and a key is pressed, or, if the newly focused element is not
  in the group, data on the newly focused element.
*/

exports.getKeyNav = async (groupLoc, startIndex, key) => {
  // Click the element and press the key.
  const locs = await groupLoc.all();
  const startLoc = locs[startIndex];
  await startLoc.click();
  await startLoc.page.keyboard.press(key);
  // Get the newly focused element.
  const newFocusData = groupLoc.evaluateAll(elements => {
    const allEls = Array.from(document.body.querySelectorAll('*'));
    const groupIndexRange = [elements[0], elements.slice(-1)]
    .map(groupEl => allEls.findIndex(groupEl));
    const newFocusElement = document.activeElement;
    const newFocusIndex = elements.findIndex(newFocusElement);
    if (newFocusIndex > -1) {
      return newFocusIndex;
    }
    else {
      const index = allEls.findIndex(newFocusElement);
      const {tagName} = newFocusElement;
      const attributes = {};
      for (const attr of newFocusElement.attributes) {
        attributes[attr.name] = attr.value;
      }
      return {
        groupIndexRange,
        index,
        tagName,
        attributes
      };
    }
  });
  // Return the result.
  return newFocusData;
};
