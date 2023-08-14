/*
  linkTitle
  Related to Tenon rule 79.
  This test reports links with title attributes whose values the link text contains.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');
// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'a[title]');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element violates the rule.
    const elData = await getLocatorData(loc);
    const title = await loc.getAttribute('title');
    const isBad = elData.excerpt.toLowerCase().includes(title.toLowerCase());
    // If it does:
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push(loc);
    }
  }
  // Populate and return the result.
  const whats = [
    'Link has a title attribute that repeats link text content',
    'Links have title attributes that repeat link text contents'
  ];
  return await report(withItems, all, 'linkTitle', whats, 0);
};
