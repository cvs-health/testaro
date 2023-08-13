/*
  attVal
  This test reports attributes with illicit values.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems, attributeName, areLicit, values) => {
  // Initialize the locators and result.
  const all = await init(page, `[${attributeName}]`);
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element violates the rule.
    const value = await loc.getAttribute(attributeName);
    const isBad = areLicit !== values.includes(value);
    // If it does:
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push([loc, value]);
    }
  }
  // Populate and return the result.
  const whats = [
    `Element has attribute ${attributeName} with illicit value “__param__”`,
    `Elements have attribute ${attributeName} with illicit values`
  ];
  return await report(withItems, all, 'attVal', whats, 2);
};
