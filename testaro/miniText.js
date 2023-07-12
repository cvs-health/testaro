/*
  miniText
  Derived from the bbc-a11y textCannotBeTooSmall test.
  Related to Tenon rule 134.
  This test reports elements with font sizes smaller than 11 pixels.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for the body elements with non-spacing text.
  const locAll = page.locator('body *:not(script, style):visible', {hasText: /[^\s]+/});
  const locs = await locAll.all();
  // For each of them:
  for (const loc of locs) {
    // If its font size is smaller that 11 pixels:
    const tinySize = await loc.evaluate(element => {
      const styleDec = window.getComputedStyle(element);
      const fontSizeString = styleDec.fontSize;
      const fontSize = Number.parseFloat(fontSizeString);
      return fontSize < 11 ? fontSize : null;
    });
    if (tinySize !== null) {
      // Add to the totals.
      totals[2]++;
      // If itemization is required:
      if (withItems) {
        // Get data on the element.
        const elData = await getLocatorData(loc);
        // Add an instance to the result.
        standardInstances.push({
          ruleID: 'miniText',
          what: `Element has a font size of ${tinySize} pixels, smaller than 11 pixels`,
          ordinalSeverity: 2,
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
      ruleID: 'miniText',
      what: 'Elements have font sizes smaller than 11 pixels',
      count: totals[2],
      ordinalSeverity: 2,
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
