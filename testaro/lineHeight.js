/*
  lineHeight
  Related to Tenon rule 144.
  This test reports elements whose line heights are less than 1.5 times their font sizes. Even
  such elements with no text create accessibility risk, because any text node added to one of
  them would have a substandard line height. Nonetheless, elements with no non-spacing text in
  their subtrees are excluded.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(100, page, 'body *', {hasText: /[^\s]/});
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element violates the rule.
    const data = await loc.evaluate(el => {
      const styleDec = window.getComputedStyle(el);
      const {fontSize, lineHeight} = styleDec;
      return {
        fontSize: Number.parseFloat(fontSize),
        lineHeight: Number.parseFloat(lineHeight)
      };
    });
    // If it does:
    const isBad = data.lineHeight < 1.5 * data.fontSize;
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push([loc, `font size ${data.fontSize} px, line height ${data.lineHeight} px`]);
    }
  }
  // Populate and return the result.
  const whats = [
    'Element line height is less than 1.5 times its font size (__param__)',
    'Elements have line heights less than 1.5 times their font sizes'
  ];
  return await report(withItems, all, 'lineHeight', whats, 1);
};
