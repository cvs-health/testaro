/*
  filter
  This test reports elements whose styles include filter. The filter style property is considered
  inherently inaccessible, because it modifies the rendering of content, overriding user settings,
  and requires the user to apply custom styles to neutralize it, which is difficult or impossible
  in some user environments.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Get locators for all elements in the body.
  const locAll = page.locator('body *');
  const locsAll = await locAll.all();
  // Initialize the standard results.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Initialize the instance locators.
  const locs = [];
  // For each locator:
  for (const loc of locsAll) {
    // If it has a filter style:
    const hasFilter = await loc.evaluate(element => {
      const styleDec = window.getComputedStyle(element);
      return styleDec.filter !== 'none';
    });
    if (hasFilter) {
      // Add it to the instance locators.
      locs.push(loc);
    }
  }
  // For each instance locator:
  for (const loc of locs) {
    // Get data on its element.
    const impact = await loc.evaluate(element => element.querySelectorAll('*').length);
    const elData = await getLocatorData(loc);
    // Add to the standard result.
    totals[2]++;
    totals[1] += impact;
    // If itemization is required:
    if (withItems) {
      // Add a standard instance for the element.
      standardInstances.push({
        ruleID: 'filter',
        what: `Element has a filter style; impacted element count: ${impact}`,
        ordinalSeverity: 2,
        tagName: elData.tagName,
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // If itemization is not required and there are any instances:
  if (! withItems && totals[2]) {
    // Adda summary instance:
    standardInstances.push({
      ruleID: 'filter',
      what: 'Elements have filter styles',
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
    // If any impact occurred:
    if (totals[1]) {
      // Add a summary instance.
      standardInstances.push({
        ruleID: 'filter',
        what: 'Elements are impacted by elements with filter styles',
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
  }
  // Return the result.
  return {
    data,
    totals,
    standardInstances
  };
};
