/*
  lineHeight
  Related to Tenon rule 144.
  This test reports elements whose line heights are less than 1.5 times their font sizes. Even
  such elements with no text create accessibility risk, because any text node added to one of
  them would have a substandard line height. Nonetheless, elements with no non-spacing text in
  their subtrees are excluded.
*/

// ########## IMPORTS

// Module to perform common operations.
const {report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Get an array of violator indexes.
  const areSquashed = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('body *'));
    return allElements.map(el => {
      const elText = el.textContent.replace(/\s/g, '');
      if (elText) {
        const styleDec = window.getComputedStyle(el);
        const fontSize = Number.parseFloat(styleDec.fontSize);
        const lineHeight = Number.parseFloat(styleDec.lineHeight);
        if (lineHeight < 1.5 * fontSize) {
          return false;
        }
        else {
          return {
            fontSize,
            lineHeight
          };
        }
      }
    });
  });
  // Get locators for all body descendants.
  const allLoc = await page.locator('body *');
  const allLocs = await allLoc.all();
  const locs = allLocs
  .map((loc, index) => [loc, areSquashed[index]])
  .filter(pair => pair[1])
  .map(pair => [pair[0], `font size ${pair[1].fontSize} px, line height ${pair[1].lineHeight} px`]);
  // Get the result.
  const all = {
    locs,
    result: {
      data: {},
      totals: [0, 0, 0, 0],
      standardInstances: []  
    }
  };
  // Populate the result.
  const whats = [
    'Element line height is less than 1.5 times its font size (__param__)',
    'Elements have line heights less than 1.5 times their font sizes'
  ];
  return await report(withItems, all, 'lineHeight', whats, 1);
};
