/*
  titledEl
  Derived from the bbc-a11y titleAttributesOnlyOnInputs test.
  This test reports title attributes on inappropriate elements.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, '[title]:not(input, button, textarea, select, iframe):visible');
  all.locs = all.allLocs;
  // Populate and return the result.
  const whats = [
    'Ineligible element has a title attribute', 'Ineligible elements have title attributes'
  ];
  return await report(withItems, all, 'titledEl', whats, 2);
};
