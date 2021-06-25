// Tabulates and lists focusable and operable elements.
exports.reporter = async page => {
  // Import a module to get the texts of an element.
  const {allText} = require('../../procs/test/allText');
  // Mark the focusable elements.
  await require('../../procs/test/markFocusable').markFocusable(page);
  // Mark the operable elements.
  await require('../../procs/test/markOperable').markOperable(page);
  // Get an array of the elements that are focusable but not operable.
  const fNotO = await page.$$('[data-autotest-focused]:not([data-autotest-operable])');
  // Get an array of the elements that are operable but not focusable.
  const oNotF = await page.$$('[data-autotest-operable]:not([data-autotest-focused])');
  // Get an array of the elements that are focusable and operable.
  const fAndO = await page.$$('[data-autotest-focused][data-autotest-operable]');
  // FUNCTION DEFINITION START
  // Recursively adds the tag names and texts of elements to an array.
  const tagAndText = async (elements, results) => {
    // If any elements remain to be processed:
    if (elements.length) {
      // Identify the first element.
      const firstElement = elements[0];
      // Get its tag name.
      const tagNameJSHandle = await firstElement.getProperty('tagName');
      const tagName = await tagNameJSHandle.jsonValue();
      // Get its texts.
      const text = await allText(page, firstElement);
      // Add its tag name and texts to the array.
      results.push({
        tagName,
        text
      });
      // Process the remaining elements.
      return await tagAndText(elements.slice(1), results);
    }
    else {
      return Promise.resolve('');
    }
  };
  // FUNCTION DEFINITION END
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
  const result = report.result;
  const totals = result.totals;
  const items = result.items;
  await tagAndText(fNotO, items.focusableButNotOperable);
  await tagAndText(oNotF, items.operableButNotFocusable);
  await tagAndText(fAndO, items.focusableAndOperable);
  totals.focusableButNotOperable = result.focusableButNotOperable.length;
  totals.operableButNotFocusable = result.operableButNotFocusable.length;
  totals.focusableAndOperable = result.focusableButNotOperable.length;
  return report;
};
