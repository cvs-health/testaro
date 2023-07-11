/*
  focVis
  Derived from the bbc-a11y elementsMustBeVisibleOnFocus test.
  This test reports links that are off the display when focused.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Get a locator for the initially visible links.
  const locAll = page.locator('a:visible');
  const locsAll = await locAll.all();
  // Get locators for those that are off the display when focused.
  const locs = [];
  for (const loc of locsAll) {
    const isOff = await loc.evaluate(element => {
      const isAbove = element.offsetTop + element.offsetHeight <= 0;
      const isLeft = element.offsetLeft + element.offsetWidth <= 0;
      const isOff = isAbove || isLeft;
      return isOff;
    });
    if (isOff) {
      locs.push(loc);
    }
  }
  // Initialize the standard result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // For each off-display link:
  for (const loc of locs) {
    // Get data on it.
    const elData = await getLocatorData(loc);
    // Add to the totals.
    totals[2]++;
    if (withItems) {
      let where;
      if (elData.location.type === 'selector') {
        where = 'above or to the left of';
      }
      else {
        const isLeft = elData.location.spec.x < 0;
        const isAbove = elData.location.spec.y < 0;
        if (isLeft && isAbove) {
          where = 'above and to the left of';
        }
        else if (isLeft) {
          where = 'to the left of';
        }
        else if (isAbove) {
          where = 'above';
        }
        else {
          where = 'possibly above or to the left of';
        }
      }
      standardInstances.push({
        ruleID: 'focVis',
        what: `Visible link is ${where} the display`,
        ordinalSeverity: 2,
        tagName: 'A',
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  if (! withItems) {
    standardInstances.push({
      ruleID: 'focVis',
      what: 'Visible links are above or to the left of the display',
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
