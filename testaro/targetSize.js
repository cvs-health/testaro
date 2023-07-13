/*
  targetSize
  Related to Tenon rule 152, but stricter.
  This test reports buttons, inputs, and non-inline links with widths or heights smaller than 44 pixels.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');
// Module to classify links.
const {isInlineLink} = require('../procs/isInlineLink');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all eligible elements.
  const nonlinkLocAll = page.locator('button, input');
  const nonlinkLocsAll = await nonlinkLocAll.all();
  const linkLocAll = page.locator('a');
  const linkLocsAll = await linkLocAll.all();
  const locs = nonlinkLocsAll;
  for (const loc of linkLocsAll) {
    if (! await isInlineLink(loc)) {
      locs.push(loc);
    }
  }
  // For each of them:
  for (const loc of locs) {
    // Get whether it violates the rule, and, if so, how.
    const howBad = await loc.evaluate(element => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      if (width < 44 || height < 44) {
        return {
          width,
          height
        };
      }
      else {
        return null;
      }
    });
    // If so:
    if (howBad) {
      // Add to the totals.
      totals[0]++;
      // If itemization is required:
      if (withItems) {
        // Get data on the element.
        const elData = await getLocatorData(loc);
        // Add an instance to the result.
        standardInstances.push({
          ruleID: 'targetSize',
          what:
          `Interactive element is only ${howBad.width} pixels wide and ${howBad.height} pixels high`,
          ordinalSeverity: 0,
          tagName: elData.tagName,
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
  }
  // If itemization is not required:
  if (! withItems) {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'targetSize',
      what: 'Interactive elements are smaller than 44 pixels wide and high',
      ordinalSeverity: 0,
      count: totals[0],
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
  // Return the result.
  return {
    data,
    totals,
    standardInstances
  };
};
