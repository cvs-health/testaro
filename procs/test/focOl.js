// Returns counts, and texts if required, of focusable elements with and without focal outlines.
exports.focOl = async (page, withItems, revealAll) => {
  // Import a module to get the texts of an element.
  const allText = withItems ? require('./allText').allText : '';
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
  // Mark the focusable elements.
  await require('./focusables').focusables(page, 'focOlMark');
  // Get an array of the focusable elements that must be and are outlined.
  const focOutYY = await page.$$('body [data-autotest-focused="YY"]');
  // Get an array of the focusable elements that must be but are not outlined.
  const focOutYN = await page.$$('body [data-autotest-focused="YN"]');
  // Get an array of the focusable elements that must not be but are outlined.
  const focOutNY = await page.$$('body [data-autotest-focused="NY"]');
  // Get an array of the focusable elements that must not be and are not outlined.
  const focOutNN = await page.$$('body [data-autotest-focused="NN"]');
  // FUNCTION DEFINITION START
  // Recursively adds the tag names and texts or counts of elements to an array.
  const compile = async (elements, totals, items, attribute) => {
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
      // Add it to the grand total for its type.
      totals[attribute].total++;
      // Add it to the total for its type and tag name.
      const tagNameTotals = totals[attribute].tagName;
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
        items[attribute].push(item);
      }
      // Process the remaining elements.
      return await compile(elements.slice(1), totals, items, attribute);
    }
    else {
      return Promise.resolve('');
    }
  };
  // FUNCTION DEFINITION END
  // Initialize the data.
  const data = {
    totals: {
      outliningWrong: {
        total: 0,
        types: {
          requiredButAbsent: {
            total: 0,
            tagName: {}
          },
          illicitButPresent: {
            total: 0,
            tagName: {}
          }
        }
      },
      outliningRight: {
        total: 0,
        types: {
          requiredAndPresent: {
            total: 0,
            tagName: {}
          },
          illicitAndAbsent: {
            total: 0,
            tagName: {}
          }
        }
      }
    }
  };
  if (withItems) {
    data.items = {
      requiredButAbsent: [],
      illicitButPresent: [],
      requiredAndPresent: [],
      illicitAndAbsent: []
    };
  }
  // Populate them.
  const rightTotals = data.totals.outliningRight.types;
  const wrongTotals = data.totals.outliningWrong.types;
  const items = data.items;
  await compile(focOutYY, rightTotals, items, 'requiredAndPresent');
  await compile(focOutYN, wrongTotals, items, 'requiredButAbsent');
  await compile(focOutNY, wrongTotals, items, 'illicitButPresent');
  await compile(focOutNN, rightTotals, items, 'illicitAndAbsent');
  const totals = data.totals;
  totals.outliningWrong.total =
    wrongTotals.requiredButAbsent.total
    + wrongTotals.illicitButPresent.total;
  totals.outliningRight.total =
    rightTotals.requiredAndPresent.total
    + rightTotals.illicitAndAbsent.total;
  // Reload the page to undo the focus and attribute changes.
  await page.reload();
  // Return the data.
  return data;
};
