/*
  headingAmb
  Related to ASLint rule headings-sibling-unique.
  This test reports same-level heading siblings in the heading hierarchy that have identical text
  contents.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Performs the test.
exports.reporter = async (page, withItems) => {
  // Initialize the standard result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all the headings.
  const headingLevels = [1, 2, 3, 4, 5, 6];
  const locAll = page.locator(headingLevels.map(level => `body h${level}`).join(', '));
  const locsAll = await locAll.all();
  const ambIndexes = await locAll.evaluateAll(headings => {
    // Initialize the array of indexes of violating headings.
    const badIndexes = [];
    // For each heading:
    headings.forEach((heading, index) => {
      // If any same-level and same-text heading precedes it:
      const priors = headings.slice(0, index);
      priors.forEach((prior, priorIndex) => {
        if (['tagName', 'textContent'].every(property => prior[property] === heading[property])) {
          // If no superior heading exists between them:
          if (
            headings
            .slice(priorIndex + 1, index)
            .every(betweenHeading => betweenHeading.tagName[1] >= heading.tagName[1])
          ) {
            // Add the index of the later heading to the index of violating headings.
            badIndexes.push(headings.indexOf(heading));
          }
        }
      });
    });
  });
  // If there were any instances:
  if (ambIndexes.length) {
    // Add to the totals.
    totals[1] = ambIndexes.length;
    // If itemization is required:
    if (withItems) {
      // For each instance:
      for (const index of ambIndexes) {
        // If it exists:
        const loc = locsAll[index];
        if (loc) {
          // Get data on the element.
          const elData = await getLocatorData(loc);
          // Add a standard instance.
          standardInstances.push({
            ruleID: 'sibHeading',
            what: 'Heading has the same text as a prior same-level sibling heading',
            ordinalSeverity: 1,
            tagName: elData.tagName,
            id: elData.id,
            location: elData.location,
            excerpt: elData.excerpt
          });
        }
        // Otherwise, i.e. if it does not exist:
        else {
          // Report this.
          console.log('ERROR: Reportedly same-text sibling heading not found');
        }
      }
    }
    // Otherwise, i.e. if itemization is not required:
    else {
      // Add a summary instance.
      standardInstances.push({
        ruleID: 'sibHeading',
        what: 'Sibling same-level headings have the same text',
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
  return {
    data,
    totals,
    standardInstances
  };
};
