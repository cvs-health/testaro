/*
  labClash
  This test reports redundant labeling of buttons, non-hidden inputs, select lists, and text areas.
  Redundant labels are labels that are superseded by other labels. Explicit and implicit (wrapped)
  labels are additive, not conflicting.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the standard result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for eligible elements.
  const locAll = page.locator('button, input:not([type=hidden]), select, textarea');
  const locsAll = await locAll.all();
  // For each of them:
  for (const loc of locsAll) {
    // Get its label types.
    const labelTypes = await loc.evaluate(element => {
      const labelTypes = [];
      // Attribute label.
      if (element.hasAttribute('aria-label')) {
        labelTypes.push('aria-label');
      }
      // Reference label.
      if (element.hasAttribute('aria-labelledby')) {
        labelTypes.push('aria-labelledby');
      }
      // Explicit and implicit labels.
      const labels = Array.from(element.labels);
      if (labels.length) {
        labelTypes.push('label');
      }
      return labelTypes;
    });
    // If it has clashing labels:
    if (labelTypes.length > 1) {
      // Add to the standard result.
      totals[2]++;
      if (withItems) {
        const elData = await getLocatorData(loc);
        standardInstances.push({
          ruleID: 'labClash',
          what: `Element has inconsistent label types (${labelTypes.join(', ')})`,
          ordinalSeverity: 2,
          tagName: elData.tagName,
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
    // If there are any instances and itemization is not required:
    if (totals[2] && ! withItems) {
      // Add a summary standard instance.
      standardInstances.push({
        ruleID: 'labClash',
        what: 'Elements have inconsistent label types',
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
  }
  return {
    data,
    totals,
    standardInstances
  };
};
