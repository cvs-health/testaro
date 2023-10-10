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

// Module to perform common operations.
const {init, report} = require('../procs/testaro');
// Module to get operabilities.
const {isOperable} = require('../procs/operable');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(100, page, 'body *');
  all.result.data.operableCount = 0;
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether and, if so, how its element is operable.
    const operabilities = await isOperable(loc);
    // If it is:
    if (operabilities.length) {
      // Add this to the report.
      all.result.data.operableCount++;
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
  const testReport = await report(withItems, all, 'opFoc', whats, 3);
  // Reload the page, because isOperable() modified it.
  try {
    await page.reload({timeout: 15000});
  }
  catch(error) {
    console.log('ERROR: page reload timed out');
  }
  return testReport;
};
