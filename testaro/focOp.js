/*
  focOp
  Related to Tenon rule 190.

  This test reports Tab-focusable elements that are not operable. The standard practice is to make
  focusable elements operable. If focusable elements are not operable, users are likely to be
  surprised that nothing happens when they try to operate such elements. The test considers an
  element operable if it has a non-inherited pointer cursor and is not a 'LABEL' element, has an
  operable tag name, has an interactive explicit role, or has an 'onclick' attribute. The test
  considers an element Tab-focusable if its tabIndex property has the value 0.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');
// Module to get operabilities.
const {isOperable} = require('../procs/operable');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'body *');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element is focusable.
    const isFocusable = await loc.evaluate(el => el.tabIndex === 0);
    // If it is:
    if (isFocusable) {
      // Get whether it is operable.
      const howOperable = await isOperable(loc);
      // If it is not:
      if (! howOperable.length) {
        // Add the locator to the array of violators.
        all.locs.push(loc);
      }
    }
  }
  // Populate and return the result.
  const whats = [
    'Element is Tab-focusable but not operable', 'Elements are Tab-focusable but not operable'
  ];
  return await report(withItems, all, 'focOp', whats, 2);
};
