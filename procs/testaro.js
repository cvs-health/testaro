// Populates the result.

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Initializes locators and a result.
exports.init = async (page, locAllSelector, options = {}) => {
  // Get locators for the specified elements.
  const locAll = page.locator(locAllSelector, options);
  const allLocs = await locAll.all();
  const result = {
    data: {},
    totals: [0, 0, 0, 0],
    standardInstances: []
  };
  // Return the result.
  return {
    allLocs,
    locs: [],
    result
  };
};

// Populates a result.
exports.report = async (withItems, all, ruleID, whats, ordinalSeverity, tagName = '') => {
  const {locs, result} = all;
  const {totals, standardInstances} = result;
  // For each instance locator:
  for (const loc of locs) {
    // Get data on its element.
    const elData = await getLocatorData(loc);
    // Add to the totals.
    totals[ordinalSeverity]++;
    // If itemization is required:
    if (withItems) {
      // Add a standard instance to the result.
      standardInstances.push({
        ruleID,
        what: whats[0],
        ordinalSeverity,
        tagName: elData.tagName,
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // If itemization is not required:
  if (! withItems) {
    // Add a summary standard instance to the result.
    standardInstances.push({
      ruleID,
      what: whats[1],
      ordinalSeverity,
      count: totals[ordinalSeverity],
      tagName,
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
  return result;
};
