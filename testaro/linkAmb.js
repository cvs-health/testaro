/*
  linkAmb
  Related to Tenon rule 98.
  This test reports text contents that are shared by links with distinct destinations.
  Text contents are compared case-insensitively.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');
// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(100, page, 'a[href]:visible');
  const linkTexts = new Set();
  // For each locator:
  for (const loc of all.allLocs) {
    // Get its text.
    const elData = await getLocatorData(loc);
    // If a previous link has the same text:
    const linkText = elData.excerpt.toLowerCase();
    if (linkTexts.has(linkText)) {
      // Add the locator to the array of violators.
      all.locs.push(loc);
    }
    // Otherwise, i.e. if this is the first link with the text:
    else {
      // Record its text.
      linkTexts.add(linkText);
    }
  }
  // Populate and return the result.
  const whats = [
    'Link has the same text as, but a different destination from, another',
    'Links have the same texts but different destinations'
  ];
  return await report(withItems, all, 'linkAmb', whats, 2);
};
