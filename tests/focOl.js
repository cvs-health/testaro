// Import a module to get the texts of an element.
const allText = require('../procs/test/allText').allText;
// Recursively adds the tag names and texts or counts of elements to an array.
const compile = async (page, elements, totals, items, itemProp, withItems) => {
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
    return await compile(page, elements.slice(1), totals, items, itemProp, withItems);
  }
  else {
    return Promise.resolve('');
  }
};
// Returns counts, and texts if required, of focusable elements with and without focal outlines.
exports.reporter = async (page, withItems, revealAll) => {
  // If all elements are to be revealed:
  if (revealAll) {
    // Make them all visible.
    await page.evaluate(() => {
      const elements = Array.from(document.body.querySelectorAll('*'));
      elements.forEach(element => {
        const styleDec = window.getComputedStyle(element);
        if (styleDec.display === 'none') {
          element.style.display = 'unset';
        }
        if (styleDec.visibility === 'hidden') {
          element.style.visibility = 'unset';
        }
      });
    });
  }
  // Mark the focusable elements as outlined or not outlined.
  await require('../procs/test/focusables').focusables(page, 'focOlMark');
  // Get an array of the focusable elements that are not outlined.
  const focOutN = await page.$$('body [data-autotest-focused="N"]');
  // Get an array of the focusable elements that are outlined.
  const focOutY = await page.$$('body [data-autotest-focused="Y"]');
  // Initialize the data.
  const data = {
    totals: {
      total: 0,
      types: {
        outlineMissing: {
          total: 0,
          tagNames: {}
        },
        outlinePresent: {
          total: 0,
          tagNames: {}
        }
      }
    }
  };
  if (withItems) {
    data.items = {
      outlineMissing: [],
      outlinePresent: []
    };
  }
  // Populate them.
  const bad = data.totals.types.outlineMissing;
  const good = data.totals.types.outlinePresent;
  const items = data.items;
  await compile(page, focOutN, bad, items, 'outlineMissing', withItems);
  await compile(page, focOutY, good, items, 'outlinePresent', withItems);
  data.totals.total = bad.total + good.total;
  // Reload the page to undo the focus and attribute changes.
  await page.reload().catch(error => {
    console.log(error.message, error.stack);
  });
  // Return the data.
  return {result: data};
};
