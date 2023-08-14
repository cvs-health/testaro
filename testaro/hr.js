/*
  hr
  Related to ASLint test horizontal-rule.
  This test reports the existence of hr elements. Their semantics are inconsistently defined and
  interpreted and impair accessibility compared with stylistic segmentation.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'body hr');
  all.locs = all.allLocs;
  // Populate and return the result.
  const whats = [
    'Element instead of styling is used for vertical segmentation',
    'Elements instead of styling are used for vertical segmentation'
  ];
  return await report(withItems, all, 'hr', whats, 0, 'HR');
};
