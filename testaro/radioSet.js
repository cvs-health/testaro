/*
  radioSet
  This test reports nonstandard grouping of radio buttons. It defines standard grouping to require
  that two or more radio buttons with the same name, and no other radio buttons, be grouped in a
  'fieldset' element with a valid 'legend' element.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

const whats = {
  nameLeak: 'shares a name with others outside its field set',
  fsMixed: 'shares a field set with others having different names',
  only1RB: 'is the only one with its name in its field set',
  legendBad: 'is in a field set without a valid legend',
  noFS: 'is not in a field set',
  noName: 'has no name attribute'
};
exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all radio buttons.
  const locAll = page.locator('input[type=radio]');
  const locs = await locAll.all();
  // For each of them:
  for (const loc of locs) {
    // Get whether and, if so, how it violates the rule.
    const howBad = await loc.evaluate(element => {
      // Get its name.
      const elName = element.name;
      // If it has one:
      if (elName) {
        // Identify the field set of the element.
        const elFS = element.closest('fieldset');
        // If it has one:
        if (elFS) {
          // Get the first child element of the field set.
          const fsChild1 = elFS.firstElementChild;
          // Get whether the child is a legend with text content.
          const legendOK = fsChild1.tagName === 'LEGEND'
          && fsChild1.textContent.replace(/\s/g, '').length;
          // If it is:
          if (legendOK) {
            // Get the count of radio buttons with the same name in the field set.
            const nameGroupSize = elFS
            .querySelectorAll(`input[type=radio][name=${elName}]`)
            .length;
            // If the count is at least 2:
            if (nameGroupSize > 1) {
              // Get the count of radio buttons in the field set.
              const groupSize = elFS.querySelectorAll('input[type=radio]').length;
              // If it is the same:
              if (groupSize === nameGroupSize) {
                // Get the count of radio buttons with the same name in the document.
                const nameDocSize = document
                .querySelectorAll(`input[type=radio][name=${elName}]`)
                .length;
                // If none of them is outside the field set:
                if (nameDocSize === nameGroupSize) {
                  // Return rule conformance.
                  return false;
                }
                else {
                  return 'nameLeak';
                }
              }
              else {
                return 'fsMixed';
              }
            }
            else {
              return 'only1RB';
            }
          }
          else {
            return 'legendBad';
          }
        }
        else {
          return 'noFS';
        }
      }
      else {
        return 'noName';
      }
    });
    // If it violates the rule:
    if (howBad) {
      // Get data on it.
      const elData = await getLocatorData(loc);
      // Add to the totals.
      totals[2]++;
      // If itemization is required:
      if (withItems) {
        standardInstances.push({
          ruleID: 'radioSet',
          what: `Radio button ${whats[howBad]}`,
          ordinalSeverity: 2,
          tagName: 'INPUT',
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
      ruleID: 'radioSet',
      what: 'Radio buttons are not validly grouped in fieldsets with legends',
      count: totals[2],
      ordinalSeverity: 2,
      tagName: 'INPUT',
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
