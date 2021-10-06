// Recursively adds the tag names and texts or counts of elements to an array.
const {tallyTags} = require('../procs/test/tallyTags');
// Returns counts, and texts if required, of focusable elements with and without focal outlines.
exports.reporter = async (page, withItems, revealAll) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/test/allVis').allVis(page);
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
  await tallyTags(page, focOutN, bad, items, 'outlineMissing', withItems);
  await tallyTags(page, focOutY, good, items, 'outlinePresent', withItems);
  data.totals.total = bad.total + good.total;
  // Return the data.
  return {result: data};
};
