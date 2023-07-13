/*
  titledEl
  Derived from the bbc-a11y titleAttributesOnlyOnInputs test.
  This test reports title attributes on inappropriate elements.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const standardInstances = [];
  // Get locators for inappropriate elements with title attributes.
  const locAll = page.locator('[title]:not(input, button, textarea, select, iframe):visible');
  const locs = await locAll.all();
  // For each of them:
  for (const loc of locs) {
    // If itemization is required:
    if (withItems) {
      // Get data on the element.
      const elData = await getLocatorData(loc);
      const rawTitle = await loc.getAttribute('title');
      const title = rawTitle.replace(/\s+/g, ' ').slice(0, 50);
      // Add an instance to the result.
      standardInstances.push({
        ruleID: 'titledEl',
        what: `Ineligible element has a title (${title})`,
        ordinalSeverity: 2,
        tagName: elData.tagName,
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // Define the totals.
  const totals = [0, 0, locs.length, 0];
  // If itemization is not required:
  if (! withItems) {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'titledEl',
      what: 'Ineligible elements have title attributes',
      ordinalSeverity: 2,
      count: totals[2],
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
  return {
    data,
    totals,
    standardInstances
  };
};
