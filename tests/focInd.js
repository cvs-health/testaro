// Recursively adds the tag names and texts or counts of elements to an array.
const tallyTags = require('../procs/test/tallyTags').tallyTags;
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
  // Mark the focusable elements as indicated or not indicated.
  await require('../procs/test/focusables').focusables(page, 'focIndMark');
  // Get an array of the focusable elements that are not indicated.
  const focOutN = await page.$$('body [data-autotest-focused="N"]');
  // Get an array of the focusable elements that are indicated.
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
  await tallyTags(page, focOutN, bad, items, 'indicatorMissing', withItems);
  await tallyTags(page, focOutY, good, items, 'indicatorPresent', withItems);
  data.totals.total = bad.total + good.total;
  // Reload the page to undo the focus and attribute changes.
  await page.reload({timeout: 10000}).catch(error => {
    console.log(error.message, error.stack.slice(0, 1000));
  });
  // Return the data.
  return {result: data};
};
