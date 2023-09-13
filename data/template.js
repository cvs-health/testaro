/*
  template
  This test reports ….
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'body a');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element violates the rule.
    const isBad = await loc.evaluate(el => {
      const isViolator = ! el.href;
      return isViolator;
    });
    // If it does:
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push(loc);
    }
  }
  // Populate and return the result.
  const whats = ['Itemized description', 'Summary description'];
  return await report(withItems, all, 'ruleID', whats, 0);
};
