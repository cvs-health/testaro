/*
  embAc
  This test reports interactive elements (links, buttons, inputs, and select lists)
  contained by links or buttons. Such embedding not only violates the HTML standard,
  but also complicates user interaction and creates risks of error. It becomes
  non-obvious what a user will activate with a click.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Get locators for all misembedded elements.
  const loc = page.locator(
    'a a, a button, a input, a select, button a, button button, button input, button select'
  );
  const locs = await loc.all();
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // For each locator:
  for (const loc of locs) {
    // Get data on its element.
    const parentTagName = await loc.evaluate(element => element.parentElement.tagName);
    const elData = await getLocatorData(loc);
    // Add data to the standard result.
    totals[2]++;
    if (withItems) {
      standardInstances.push({
        ruleID: 'embAc',
        what: `Interactive element is embedded in a ${parentTagName === 'A' ? 'link' : 'button'}`,
        ordinalSeverity: 2,
        tagName: elData.tagName,
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  };
  if (! withItems) {
    standardInstances.push({
      ruleID: 'embAc',
      what: 'Interactive elements are contained by links or buttons',
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
