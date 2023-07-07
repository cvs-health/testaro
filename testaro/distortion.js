/*
  distortion
  Related to Tenon rule 271.
  This test reports elements whose transform style properties distort the content. Distortion makes
  text difficult to read.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Runs the test and returns the results.
exports.reporter = async (page, withItems) => {
  // Get locators for all body elements.
  const locAll = page.locator('body *');
  const locsAll = await locAll.all();
  // Get those that:
  const locs = locsAll.filter(async loc => {
    const isDistorted = await loc.evaluate(el => {
      // Have distorting transform styles.
      const styleDec = window.getComputedStyle(el);
      const {transform} = styleDec;
      return transform
      && ['matrix', 'perspective', 'rotate', 'scale', 'skew'].some(key => transform.includes(key));
    });
    return isDistorted;
  });
  // Initialize the results.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // For each qualifying locator:
  for (const loc of locs) {
    // Get data on its element.
    const elData = await getLocatorData(loc);
    // Add to the totals.
    totals[1]++;
    // If itemization is required:
    if (withItems) {
      // Add a standard instance.
      standardInstances.push({
        ruleID: 'distortion',
        what: 'Element distorts its text',
        ordinalSeverity: 1,
        tagName: elData.tagName,
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // If itemization is not required:
  if (! withItems) {
    // Add a summary standard instance.
    standardInstances.push({
      ruleID: 'distortion',
      what: 'Elements distort their texts',
      ordinalSeverity: 1,
      count: totals[1],
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
