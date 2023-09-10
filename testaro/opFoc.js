/*
  opFoc
  Related to Tenon rule 190.

  This test reports operable elements that are not Tab-focusable. The standard practice is to make
  operable elements focusable. If operable elements are not focusable, users who navigate with a
  keyboard are prevented from operating those elements. The test considers an element operable if
  it has a non-inherited pointer cursor and is not a 'LABEL' element, has an operable tag name, has
  an interactive explicit role, or has an 'onclick' attribute. The test considers an element
  Tab-focusable if its tabIndex property has the value 0.
*/

// ########## IMPORTS

// Module to get operabilities.
const {isOperable} = require('../procs/operable');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'body *');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether and, if so, how its element is operable.
    const operabilities = await isOperable(loc);
    // If it is:
    if (operabilities.length) {
      // Get whether it is focusable.
      const isFocusable = await loc.evaluate(el => el.tabIndex === 0);
      // If it is not:
      if (! isFocusable) {
        // Add the locator to the array of violators.
        all.locs.push([loc, operabilities.join(', ')]);
      }
    }
  }
  // Populate and return the result.
  const whats = [
    'Element is operable (__param__) but not Tab-focusable',
    'Elements are operable but not Tab-focusable'
  ];
  return await report(withItems, all, 'opFoc', whats, 3);
};
