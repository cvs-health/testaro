/*
  linkAmb
  Related to Tenon rule 98.
  This test reports text contents that are shared by links with distinct destinations.
  Text contents are compared case-insensitively.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for the visible links with destinations.
  const locAll = page.locator('a[href]:visible');
  const locsAll = await locAll.all();
  // Get data on them.
  const excerpts = new Set();
  for (const loc of locsAll) {
    const elData = await getLocatorData(loc);
    if (excerpts.has(elData.excerpt.toLowerCase())) {
      totals[2]++;
      if (withItems) {
        standardInstances.push({
          ruleID: 'linkAmb',
          what: 'Link has the same text as, but a different destination from, another',
          ordinalSeverity: 2,
          tagName: 'A',
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
    else {
      excerpts.add(elData.excerpt.toLowerCase());
    }
  }
  if (! withItems && totals[2]) {
    standardInstances.push({
      ruleID: 'linkAmb',
      what: 'Links have the same texts but different destinations',
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
  return {
    data,
    totals,
    standardInstances
  };
};
