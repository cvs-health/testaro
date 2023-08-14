/*
  focVis
  Derived from the bbc-a11y elementsMustBeVisibleOnFocus test.
  This test reports links that are off the display when focused.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'a:visible');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get how its element violates the rule, if it does.
    const isBad = await loc.evaluate(el => {
      const isAbove = el.offsetTop + el.offsetHeight <= 0;
      const isLeft = el.offsetLeft + el.offsetWidth <= 0;
      return [isAbove, isLeft];
    });
    // If it does:
    if (isBad[0] || isBad[1]) {
      // Add the locator to the array of violators.
      let param;
      if (isBad[0] && isBad[1]) {
        param = 'above and to the left of';
      }
      else if (isBad[0]) {
        param = 'above';
      }
      else {
        param = 'to the left of';
      }
      all.locs.push([loc, param]);
    }
  }
  // Populate and return the result.
  const whats = [
    'Visible link is __param__ the display',
    'Visible links are above or to the left of the display'
  ];
  return await report(withItems, all, 'focVis', whats, 2);
};
