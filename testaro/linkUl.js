/*
  linkUl
  This test reports failures to underline inline links. Underlining and color are the traditional
  style properties that identify links. Lists of links containing only links can be recognized
  without underlines, but other links are difficult or impossible to distinguish visually from
  surrounding text if not underlined. Underlining adjacent links only on hover provides an
  indicator valuable only to mouse users, and even they must traverse the text with a mouse
  merely to discover which passages are links.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');
// Module to classify links.
const {isInlineLink} = require('../procs/isInlineLink');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all inline links.
  const locAll = page.locator('a');
  const locsAll = await locAll.all();
  const inlineLocs = [];
  for (const loc of locsAll) {
    if (await isInlineLink(loc)) {
      inlineLocs.push(loc);
    }
  }
  // Get locators for all non-underlined inline links.
  const locs = [];
  for (const loc of inlineLocs) {
    const isUnderlined = await loc.evaluate(element => {
      const styleDec = window.getComputedStyle(element);
      return styleDec.textDecorationLine === 'underline';
    });
    if (! isUnderlined) {
      locs.push(loc);
    }
  }
  // Add to the totals.
  totals[1] = locs.length;
  // If itemization is required:
  if (withItems) {
    // For each non-underlined inline link:
    for (const loc of locs) {
      // Get data on it.
      const elData = await getLocatorData(loc);
      // Add an instance to the result.
      standardInstances.push({
        ruleID: 'linkUl',
        what: 'Link is inline but has no underline',
        ordinalSeverity: 1,
        tagName: 'A',
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // Otherwise, i.e. if itemization is not required:
  else {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'linkUl',
      what: 'Inline links are missing underlines',
      count: totals[1],
      ordinalSeverity: 1,
      tagName: 'A',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
  }
  // Return the result.
  return {
    data,
    totals,
    standardInstances
  };
};
