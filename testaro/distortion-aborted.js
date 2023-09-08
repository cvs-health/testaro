/*
  distortion
  Related to Tenon rule 271.
  This test reports elements whose transform style properties distort the content. Distortion makes
  text difficult to read.
*/

// ########## IMPORTS

// Module to perform common operations.
const {report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Get an array of violator indexes.
  const areDistorted = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('body *'));
    return allElements.map(el => {
      const styleDec = window.getComputedStyle(el);
      const {transform} = styleDec;
      return transform
      && ['matrix', 'perspective', 'rotate', 'scale', 'skew'].some(key => transform.includes(key));
    });
  });
  // Get locators for all body descendants.
  const allLoc = await page.locator('body *');
  const allLocs = await allLoc.all();
  // Get the result.
  const all = {
    locs: allLocs.filter((loc, index) => areDistorted[index]),
    result: {
      data: {},
      totals: [0, 0, 0, 0],
      standardInstances: []  
    }
  };
  // Populate the result.
  const whats = ['Element distorts its text', 'Elements distort their texts'];
  return await report(withItems, all, 'distortion', whats, 1);
};
