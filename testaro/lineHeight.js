/*
  lineHeight
  Related to Tenon rule 144.
  This test reports elements whose line heights are less than 1.5 times their font sizes. Even
  such elements with no text create accessibility risk, because any text node added to one of
  them would have a substandard line height. Nonetheless, elements with no non-spacing text in
  their subtrees are excluded.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Gets the ratio of line height to font size not reached, as text, from an ordinal severity.
const getRatio = ordinalSeverity => ['1.5', '1.3', '1.1', '0.9'][ordinalSeverity];
exports.reporter = async (page, withItems) => {
  // Initialize the standard result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all body elements with any descendant non-spacing text.
  const locAll = page.locator('body *', {hasText: /[^\s]/});
  const locsAll = await locAll.all();
  // For each of them:
  for (const loc of locsAll) {
    // Get data on it.
    const facts = await loc.evaluate(element => {
      const styleDec = window.getComputedStyle(element);
      const {fontSize, lineHeight} = styleDec;
      return {
        fontSize: Number.parseFloat(fontSize),
        lineHeight: Number.parseFloat(lineHeight)
      };
    });
    // If its line height is substandard:
    const ratio = facts.lineHeight / facts.fontSize;
    let ordinalSeverity = -1;
    if (ratio < 0.9) {
      ordinalSeverity = 3;
    }
    else if (ratio < 1.1) {
      ordinalSeverity = 2;
    }
    else if (ratio < 1.3) {
      ordinalSeverity = 1;
    }
    else if (ratio < 1.5) {
      ordinalSeverity = 0;
    }
    if (ordinalSeverity > -1) {
      // Add to the totals.
      totals[ordinalSeverity]++;
      // If itemization is required:
      if (withItems) {
        // Get data on the element.
        const elData = await getLocatorData(loc);
        // Add a standard instance.
        standardInstances.push({
          ruleID: 'lineHeight',
          what:
          `Element line height ${facts.lineHeight} px is less than ${getRatio(ordinalSeverity)} times its font size ${facts.fontSize} px`,
          ordinalSeverity,
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
    // For each ordinal severity:
    [0, 1, 2, 3].forEach(ordinalSeverity => {
      // If there are instances with it:
      if (totals[ordinalSeverity]) {
        // Add a summary instance.
        standardInstances.push({
          ruleID: 'lineHeight',
          what:
          `Elements have line heights less than ${getRatio(ordinalSeverity)} times their font sizes`,
          ordinalSeverity,
          count: totals[ordinalSeverity],
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
    });
  }
  return {
    data,
    totals,
    standardInstances
  };
};
