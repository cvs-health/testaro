// Returns counts, and texts if required, of (un)focusable and (in)operable elements.
exports.focOp = async (page, withItems) => {
  // Import a module to get the texts of an element.
  const allText = withItems ? require('./allText').allText : '';
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
  const compile = async (elements, totals, items, attribute, isF, isO) => {
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
      // Add it to the total.
      totals[attribute].total++;
      // Get its texts or count.
      const text = withItems ? await allText(page, firstElement) : '';
      // Add its tag name and texts or count to the array.
      results.push({
        tagName,
        text
      });
      // Process the remaining elements.
      return await compile(elements.slice(1), results);
    }
    else {
      return Promise.resolve('');
    }
  };
  // FUNCTION DEFINITION END
  // Initialize a report.
  const report = {result: {
    totals: {
      focusableNotOperable: {
        total: 0,
        tagName: {},
        focusableHow: {
          Tab: 0,
          'Shift+Tab': 0,
          ArrowRight: 0,
          ArrowDown: 0
        }
      },
      operableNotFocusable: {
        total: 0,
        tagName: {},
        operableWhy: {
          tag: 0,
          cursor: 0,
          onclick: 0
        }
      },
      focusableAndOperable: {
        total: 0,
        tagName: {},
        focusableHow: {
          Tab: 0,
          'Shift+Tab': 0,
          ArrowRight: 0,
          ArrowDown: 0
        },
        operableWhy: {
          tag: 0,
          cursor: 0,
          onclick: 0
        }
      }
    },
    items: {
      focusableNotOperable: [],
      operableNotFocusable: [],
      focusableAndOperable: []
    }
  }};
  // Populate it.
  const result = report.result;
  const totals = result.totals;
  const items = result.items;
  await compile(fNotO, totals, items, 'focusableNotOperable', true, false);
  await compile(oNotF, totals, items, 'operableNotFocusable', false, true);
  await compile(fAndO, totals, items, 'focusableAndOperable', true, true);
  // Return it.
  return report;
};
