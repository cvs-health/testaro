/*
  linkTo
  Derived from the bbc-a11y anchorsMustHaveHrefs test.
  This test reports failures to equip links with destinations.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for the visible links without href attributes.
  const locAll = page.locator('a:not([href]):visible');
  const locs = await locAll.all();
  // For each of them:
  for (const loc of locs) {
    // If itemization is required:
    if (withItems) {
      // Get data on the element.
      const elData = await getLocatorData(loc);
      // Add an instance to the result.
      standardInstances.push({
        ruleID: 'linkTo',
        what: 'Link has no href attribute',
        ordinalSeverity: 2,
        tagName: 'A',
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // Add to the totals.
  totals[2] = locs.length;
  // If itemization is not required:
  if (! withItems) {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'linkTo',
      what: 'Links are missing href attributes',
      count: totals[2],
      ordinalSeverity: 2,
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
