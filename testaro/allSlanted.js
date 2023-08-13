/*
  allSlanted
  Related to Tenon rule 154.
  This test reports elements with italic or oblique text at least 40 characters long. Blocks of
  slanted text are difficult to read.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'body *:not(style):not(script):not(svg)');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element violates the rule.
    const isBad = await loc.evaluate(el => {
      const elStyleDec = window.getComputedStyle(el);
      const elText = el.textContent;
      return ['italic', 'oblique'].includes(elStyleDec.fontStyle) && elText.length > 39;
    });
    // If it does:
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push(loc);
    }
  }
  // Populate and return the result.
  const whats = [
    'Element contains all-italic or all-oblique text',
    'Elements contain all-italic or all-oblique text'
  ];
  return await report(withItems, all, 'allSlanted', whats, 0);
};
