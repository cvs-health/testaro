// Recursively adds the tag names and texts or counts of elements to an array.
const {tallyTags} = require('../procs/test/tallyTags');
// Returns counts, and texts if required, of focusable elements with and without indicators.
exports.reporter = async (page, withItems, revealAll) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/test/allVis').allVis(page);
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
        indicatorMissing: {
          total: 0,
          tagNames: {}
        },
        indicatorPresent: {
          total: 0,
          tagNames: {}
        }
      }
    }
  };
  if (withItems) {
    data.items = {
      indicatorMissing: [],
      indicatorPresent: []
    };
  }
  // Populate them.
  const bad = data.totals.types.indicatorMissing;
  const good = data.totals.types.indicatorPresent;
  const items = data.items;
  await tallyTags(page, focOutN, bad, items, 'indicatorMissing', withItems);
  await tallyTags(page, focOutY, good, items, 'indicatorPresent', withItems);
  data.totals.total = bad.total + good.total;
  // Reload the page to undo the focus and attribute changes.
  await require('../procs/test/reload').reload(page);
  // Return the data.
  return {result: data};
};
