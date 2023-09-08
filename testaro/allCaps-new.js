/*
  allCaps
  Related to Tenon rule 153.
  This test reports elements with native or transformed upper-case text at least 8 characters long.
  Blocks of upper-case text are difficult to read.
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
      const elText = Array
      .from(el.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(textNode => textNode.nodeValue)
      .join(' ');
      // If the element text includes 8 sequential upper-case letters, spaces, or hyphen-minuses:
      if (/[- A-Z]{8}/.test(elText)) {
        // Report this.
        return true;
      }
      // Otherwise:
      else {
        // Report whether its text is at least 8 characters long and transformed to upper case.
        const elStyleDec = window.getComputedStyle(el);
        const transformStyle = elStyleDec.textTransform;
        return transformStyle === 'uppercase' && elText.length > 7;
      }
    });
    // If it does:
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push(loc);
    }
  }
  // Populate and return the result.
  const whats = ['Element contains all-capital text', 'Elements contain all-capital text'];
  return await report(withItems, all, 'allCaps', whats, 0);
};
