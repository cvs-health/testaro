/*
  linkTo
  Derived from the bbc-a11y anchorsMustHaveHrefs test.
  This test reports failures to equip links with destinations.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'a:not([href]):visible');
  all.locs = all.allLocs;
  // Populate and return the result.
  const whats = ['Link has no href attribute', 'Links are missing href attributes'];
  return await report(withItems, all, 'linkTo', whats, 2, 'A');
};
