// Returns counts, and texts if required, of (un)focusable and (in)operable elements.
exports.focOp = async (page, withItems) => {
  // Import a module to get the texts of an element.
  const {allText} = require('./allText');
  // Mark the focusable elements.
  await require('./markFocusable').markFocusable(page);
  // Mark the operable elements.
  await require('./markOperable').markOperable(page);
  // Get an array of the elements that are focusable but not operable.
  const fNotO = await page.$$('body [data-autotest-focused]:not([data-autotest-operable])');
  // Get an array of the elements that are operable but not focusable.
  const oNotF = await page.$$('body [data-autotest-operable]:not([data-autotest-focused])');
  // Get an array of the elements that are focusable and operable.
  const fAndO = await page.$$('body [data-autotest-focused][data-autotest-operable]');
  // FUNCTION DEFINITION START
  // Recursively adds the tag names and texts or counts of elements to an array.
  const addItems = async (elements, results) => {
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
      // Get its texts or count.
      const text = withItems ? await allText(page, firstElement) : '';
      // Add its tag name and texts or count to the array.
      results.push({
        tagName,
        text
      });
      // Process the remaining elements.
      return await addItems(elements.slice(1), results);
    }
    else {
      return Promise.resolve('');
    }
  };
  // FUNCTION DEFINITION END
  // Initialize a report.
  const report = {result: {
    totals: {
      focusableButNotOperable: 0,
      operableButNotFocusable: 0,
      focusableAndOperable: 0
    },
    items: {
      focusableButNotOperable: [],
      operableButNotFocusable: [],
      focusableAndOperable: []
    }
  }};
  // Populate it.
  const result = report.result;
  const totals = result.totals;
  const items = result.items;
  await addItems(fNotO, items.focusableButNotOperable);
  await addItems(oNotF, items.operableButNotFocusable);
  await addItems(fAndO, items.focusableAndOperable);
  totals.focusableButNotOperable = items.focusableButNotOperable.length;
  totals.operableButNotFocusable = items.operableButNotFocusable.length;
  totals.focusableAndOperable = items.focusableAndOperable.length;
  // Return it.
  return report;
};
