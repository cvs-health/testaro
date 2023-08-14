/*
  linkUl
  This test reports failures to underline inline links. Underlining and color are the traditional
  style properties that identify links. Lists of links containing only links can be recognized
  without underlines, but other links are difficult or impossible to distinguish visually from
  surrounding text if not underlined. Underlining adjacent links only on hover provides an
  indicator valuable only to mouse users, and even they must traverse the text with a mouse
  merely to discover which passages are links.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');
// Module to classify links.
const {isInlineLink} = require('../procs/isInlineLink');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'a');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element is underlined.
    const isUnderlined = await loc.evaluate(el => {
      const styleDec = window.getComputedStyle(el);
      return styleDec.textDecorationLine === 'underline';
    });
    // If it is not:
    if (! isUnderlined) {
      // Get whether it is inline.
      const isInline = await isInlineLink(loc);
      // If it is:
      if (isInline) {
        // Add the locator to the array of violators.
        all.locs.push(loc);
      }
    }
  }
  // Populate and return the result.
  const whats = ['Link is inline but has no underline', 'Inline links are missing underlines'];
  return await report(withItems, all, 'linkUl', whats, 1);
};
