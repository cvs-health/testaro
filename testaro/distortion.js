/*
  distortion
  Related to Tenon rule 271.
  This test reports elements whose transform style properties distort the content. Distortion makes
  text difficult to read.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'body *');
  // Get those that have distorting transform styles.
  for (const loc of all.allLocs) {
    const isDistorted = await loc.evaluate(el => {
      const styleDec = window.getComputedStyle(el);
      const {transform} = styleDec;
      return transform
      && ['matrix', 'perspective', 'rotate', 'scale', 'skew'].some(key => transform.includes(key));
    });
    if (isDistorted) {
      all.locs.push(loc);
    }
  }
  // Populate the result.
  const whats = ['Element distorts its text', 'Elements distort their texts'];
  return await report(withItems, all, 'distortion', whats, 1);
};
