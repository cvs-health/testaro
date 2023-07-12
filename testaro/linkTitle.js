/*
  linkTitle
  Related to Tenon rule 79.
  This test reports links with title attributes with values contained in the link text contents.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for the links with title attributes.
  const locAll = page.locator('a[title]');
  const locs = await locAll.all();
  // For each of them:
  for (const loc of locs) {
    // Get data on it.
    const title = await loc.getAttribute('title');
    const elData = await getLocatorData(loc);
    // If the title value is contained in the excerpt:
    if (elData.excerpt.toLowerCase().includes(title.toLowerCase())) {
      // Add to the result.
      totals[0]++;
      if (withItems) {
        standardInstances.push({
          ruleID: 'linkTitle',
          what: 'Link has a title attribute that repeats link text content',
          ordinalSeverity: 0,
          tagName: 'A',
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
  }
  // If itemization is not required and there are any instances:
  if (! withItems && totals[0]) {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'linkTitle',
      what: 'Links have title attributes that repeat link text contents',
      count: totals[0],
      ordinalSeverity: 0,
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
  return {
    data,
    totals,
    standardInstances
  };
};
