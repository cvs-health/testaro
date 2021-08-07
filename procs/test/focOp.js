// Returns counts, and texts if required, of (un)focusable and (in)operable elements.
exports.focOp = async (page, withItems, revealAll) => {
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
  // Mark any focusable elements.
  await require('./focusables').focusables(page, 'focusMark');
  // Mark the operable elements that are visible or focused-marked.
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
      let how = '';
      let why = '';
      // If it is focusable:
      if (isF) {
        // Add it to the total for its type and focus method:
        const howTotals = totals[attribute].focusableHow;
        how = await firstElement.getAttribute('data-autotest-focused');
        if (howTotals[how]) {
          howTotals[how]++;
        }
        else {
          howTotals[how] = 1;
        }
      }
      // If it is operable:
      if (isO) {
        // Add it to the total for its type and operability evidence:
        const whyTotals = totals[attribute].operableWhy;
        why = await firstElement.getAttribute('data-autotest-operable');
        if (whyTotals[why]) {
          whyTotals[why]++;
        }
        else {
          whyTotals[why] = 1;
        }
      }
      // If itemization is required:
      if (withItems) {
        // Add the item to the itemization.
        const item = {tagName};
        if (isF) {
          item.focusableHow = how;
        }
        if (isO) {
          item.operableWhy = why;
        }
        const text = await allText(page, firstElement);
        item.text = text;
        items[attribute].push(item);
      }
      // Process the remaining elements.
      return await compile(elements.slice(1), totals, items, attribute, isF, isO);
    }
    else {
      return Promise.resolve('');
    }
  };
  // FUNCTION DEFINITION END
  // Initialize the data.
  const data = {
    totals: {
      focusableNotOperable: {
        total: 0,
        tagName: {},
        focusableHow: {
          Tab: 0,
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
  };
  // Populate them.
  const totals = data.totals;
  const items = data.items;
  await compile(fNotO, totals, items, 'focusableNotOperable', true, false);
  await compile(oNotF, totals, items, 'operableNotFocusable', false, true);
  await compile(fAndO, totals, items, 'focusableAndOperable', true, true);
  // Reload the page to undo the focus and attribute changes.
  await page.reload();
  // Return it.
  return data;
};
