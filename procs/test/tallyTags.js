// Import a module to get the texts of an element.
const allText = require('./allText').allText;
// Recursively adds the tag names and texts or counts of elements to an array.
const tallyTags = async (page, elements, totals, items, itemProp, withItems) => {
  // If any elements remain to be processed:
  if (elements.length) {
    // Identify the first element.
    const firstElement = elements[0];
    // Get its tag name, lower-cased.
    const tagNameJSHandle = await firstElement.getProperty('tagName');
    let tagName = await tagNameJSHandle.jsonValue();
    tagName = tagName.toLowerCase();
    // If it is “input”, add its type.
    if (tagName === 'input') {
      const type = await firstElement.getAttribute('type');
      if (type) {
        tagName += `[type=${type}]`;
      }
    }
    // Increment the total of elements of the type.
    totals.total++;
    // Add it to the total for its type and tag name.
    const tagNameTotals = totals.tagNames;
    if (tagNameTotals[tagName]) {
      tagNameTotals[tagName]++;
    }
    else {
      tagNameTotals[tagName] = 1;
    }
    // If itemization is required:
    if (withItems) {
      // Add the item to the itemization.
      const item = {tagName};
      const text = await allText(page, firstElement);
      item.text = text;
      items[itemProp].push(item);
    }
    // Process the remaining elements.
    return await tallyTags(page, elements.slice(1), totals, items, itemProp, withItems);
  }
  else {
    return Promise.resolve('');
  }
};
exports = {tallyTags};
