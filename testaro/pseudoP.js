/*
  pseudoP
  Related to Tenon rule 242.
  This test reports 2 or more sequential br elements. They may be inferior substitutes for a
  p element.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'body *', {has: page.locator('br + br')});
  // For each locator:
  for (const loc of all.allLocs) {
    const isBad = await loc.evaluate(el => {
      // Get whether it has 2 adjacent br elements with no non-space text between them.
      const childNodes = Array.from(el.childNodes);
      const realChildNodes = childNodes.filter(
        node => node.nodeType !== Node.TEXT_NODE || node.nodeValue.replace(/\s/g, '').length
      );
      return realChildNodes.some(
        (node, index) => node.nodeName === 'BR' && realChildNodes[index + 1].nodeName === 'BR'
      );
    });
    // If it does:
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push(loc);
    }
  }
  // Populate and return the result.
  const whats = [
    'Element contains 2 or more adjacent br elements that may be a pseudo-paragraph',
    'Elements contain 2 or more adjacent br elements that may be pseudo-paragraphs'
  ];
  return await report(withItems, all, 'pseudoP', whats, 0);
};
