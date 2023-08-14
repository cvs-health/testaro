/*
  linkExt
  Related to Tenon rule 218, but stricter.
  This test reports links with target attributes with _blank values, because forcibly external links
  risk miscommunication of the externality and remove control from the user.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'a[target=_blank]');
  all.locs = all.allLocs;
  // Populate and return the result.
  const whats = ['Link has a target=_blank attribute', 'Links have target=_blank attributes'];
  return await report(withItems, all, 'linkExt', whats, 0);
};
