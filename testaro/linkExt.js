/*
  linkExt
  Related to Tenon rule 218, but stricter.
  This test reports links with target attributes with _blank values, because forcibly external links
  risk miscommunication of the externality and remove control from the user.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for links with target=_blank attributes.
  const locAll = page.locator('a[target=_blank]');
  const locs = await locAll.all();
  // Add to the result.
  totals[0] = locs.length;
  // If itemization is required:
  if (withItems) {
    // For each such link:
    for (const loc of locs) {
      // Get data on it.
      const elData = await getLocatorData(loc);
      // Add to the result.
      standardInstances.push({
        ruleID: 'linkExt',
        what: 'Link has a target=_blank attribute',
        ordinalSeverity: 0,
        tagName: 'A',
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // Otherwise, i.e. if itemization is not required:
  else {
    // Add a summary instance.
    standardInstances.push({
      ruleID: 'linkExt',
      what: 'Links have target=_blank attributes',
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
