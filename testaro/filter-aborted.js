/*
  filter
  This test reports elements whose styles include filter. The filter style property is considered
  inherently inaccessible, because it modifies the rendering of content, overriding user settings,
  and requires the user to apply custom styles to neutralize it, which is difficult or impossible
  in some user environments.
*/

// ########## IMPORTS

// Module to perform common operations.
const {report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Get an array of violator indexes.
  const areFiltered = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('body *'));
    return allElements.map(el => {
      const styleDec = window.getComputedStyle(el);
      return styleDec.filter !== 'none';
    });
  });
  // Get locators for all body descendants.
  const allLoc = await page.locator('body *');
  const allLocs = await allLoc.all();
  // Get the result.
  const all = {
    locs: allLocs.filter((loc, index) => areFiltered[index]),
    result: {
      data: {},
      totals: [0, 0, 0, 0],
      standardInstances: []  
    }
  };
  // Populate and return the result.
  const whats = ['Element has a filter style', 'Elements have filter styles'];
  return await report(withItems, all, 'filter', whats, 2);
};
