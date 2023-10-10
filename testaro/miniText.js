/*
  miniText
  Derived from the bbc-a11y textCannotBeTooSmall test.
  Related to Tenon rule 134.
  This test reports elements with font sizes smaller than 11 pixels.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(100, page, 'body *:not(script, style):visible', {hasText: /[^\s]+/});
  // For each locator:
  for (const loc of all.allLocs) {
    // Get the font size of its element if less than 11 pixels.
    const fontSize = await loc.evaluate(el => {
      const styleDec = window.getComputedStyle(el);
      const fontSizeString = styleDec.fontSize;
      const fontSize = Number.parseFloat(fontSizeString);
      return fontSize < 11 ? fontSize : null;
    });
    // If it violates the rule:
    if (fontSize) {
      // Add the locator to the array of violators.
      all.locs.push([loc, fontSize]);
    }
  }
  // Populate and return the result.
  const whats = [
    'Element has a font size of __param__ pixels, smaller than 11 pixels',
    'Elements have font sizes smaller than 11 pixels'
  ];
  return await report(withItems, all, 'miniText', whats, 2);
};
