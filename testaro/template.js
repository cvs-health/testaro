/*
  template
  This test reports ….
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
  const locAll = page.locator('body *', {option: ''});
  const locsAll = await locAll.all();
  // For each of them:
  for (const loc of locsAll) {
    // Get data on it.
    const facts = await loc.evaluate(element => {
      return element.something;
    });
    // If there are any instances:
    if (facts.length) {
      // Add to the totals.
      totals[0]++;
      // If itemization is required:
      if (withItems) {
        // Get data on the element.
        const elData = await getLocatorData(loc);
        // Add a standard instance.
        standardInstances.push({
          ruleID: 'template',
          what: 'Element is bad',
          ordinalSeverity: 0,
          tagName: elData.tagName,
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
  }
  // If itemization is not required:
  if (! withItems) {
    // For each ordinal severity:
    [0, 1, 2, 3].forEach(ordinalSeverity => {
      // If there are instances with it:
      if (totals[ordinalSeverity]) {
        // Add a summary instance.
        standardInstances.push({
          ruleID: 'template',
          what: 'Elements are bad',
          ordinalSeverity,
          count: totals[ordinalSeverity],
          tagName: '',
          id: '',
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: ''
        });
      }
    });
  }
  return {
    data,
    totals,
    standardInstances
  };
};
