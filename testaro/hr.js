/*
  hr
  Related to ASLint test horizontal-rule.
  This test reports the existence of hr elements. Their semantics are inconsistently defined and
  interpreted and impair accessibility compared with stylistic segmentation.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Performs the test.
exports.reporter = async (page, withItems) => {
  // Initialize the standard result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all applicable elements.
  const locAll = page.locator('body hr');
  const locsAll = await locAll.all();
  // For each of them:
  for (const loc of locsAll) {
    // Add to the totals.
    totals[0]++;
    // If itemization is required:
    if (withItems) {
      // Get data on the element.
      const elData = await getLocatorData(loc);
      // Add a standard instance.
      standardInstances.push({
        ruleID: 'hr',
        what: 'Element instead of styling is used for vertical segmentation',
        ordinalSeverity: 0,
        tagName: 'HR',
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // If itemization is not required and there are instances:
  if (! withItems && totals[0]) {
    // Add a summary instance.
    standardInstances.push({
      ruleID: 'hr',
      what: 'Elements instead of styling are used for vertical segmentation',
      ordinalSeverity: 0,
      count: totals[0],
      tagName: 'HR',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
  }
  return {
    data,
    totals,
    standardInstances
  };
};
