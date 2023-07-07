/*
  attVal
  This test reports attributes with illicit values.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Runs the test and returns the results.
exports.reporter = async (page, withItems, attributeName, areLicit, values) => {
  // Get locators for all elements with the attribute.
  const locAll = page.locator(`[${attributeName}]`);
  const locsAll = await locAll.all();
  // Get those that:
  const locs = locsAll.filter(async loc => {
    // Have illicit values on the attribute.
    const value = await loc.getAttribute(attributeName);
    console.log(`value is ${value}`);
    if (areLicit) {
      console.log('Specs are licit');
      console.log(`About to decide ${! values.includes(value)}`);
      return ! values.includes(value);
    }
    else {
      return values.includes(value);
    }
  });
  console.log(`Count of illicits: ${locs.length}`);
  // Initialize the results.
  const data = {};
  const totals = [0, 0, locs.length, 0];
  const standardInstances = [];
  // If itemization is required:
  if (withItems) {
    // For each qualifying locator:
    for (const loc of locs) {
      // Get data on its element.
      const elData = await getLocatorData(loc);
      // Get the illicit value of the attribute.
      const badValue = await loc.getAttribute(attributeName);
      // Add a standard instance.
      standardInstances.push({
        ruleID: 'attVal',
        what: `Element has attribute ${attributeName} with illicit value ${badValue}`,
        ordinalSeverity: 2,
        tagName: elData.tagName,
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // Otherwise, i.e. if itemization is not required:
  else {
    // Add a summary standard instance.
    standardInstances.push({
      ruleID: 'attVal',
      what: `Elements have attribute ${attributeName} with illicit values`,
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
