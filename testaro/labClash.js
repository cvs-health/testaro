/*
  labClash
  This test reports redundant labeling of buttons, non-hidden inputs, select lists, and text areas.
  Redundant labels are labels that are superseded by other labels. Explicit and implicit (wrapped)
  labels are additive, not conflicting.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'button, input:not([type=hidden]), select, textarea');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get the label types of its element.
    const labelTypes = await loc.evaluate(el => {
      const labelTypes = [];
      // Attribute and reference labels.
      ['aria-label', 'aria-labelledby'].forEach(type => {
        if (el.hasAttribute(type)) {
          labelTypes.push(type);
        }
      });
      // Explicit and implicit labels.
      const labels = Array.from(el.labels);
      if (labels.length) {
        labelTypes.push('label');
      }
      return labelTypes;
    });
    // If it has more than 1:
    if (labelTypes.length > 1) {
      // Add the locator and a list of them to the array of violators.
      all.locs.push([loc, labelTypes.join(', ')]);
    }
  }
  // Populate and return the result.
  const whats = [
    'Element has inconsistent label types (__param__)', 'Elements have inconsistent label types'
  ];
  return await report(withItems, all, 'labClash', whats, 2);
};
