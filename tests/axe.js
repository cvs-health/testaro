/*
  axe
  This test implements the axe-core ruleset for accessibility.

  The rules argument defaults to all rules; otherwise, specify an array of rule names.
  Experimental, needs-review, and best-practice rules are ignored.
*/
// IMPORTS
const {injectAxe, getAxeResults} = require('axe-playwright');
// FUNCTIONS
// Conducts and reports an Axe test.
exports.reporter = async (page, withItems, rules = []) => {
  // Initialize the report.
  const data = {};
  // Inject axe-core into the page.
  await injectAxe(page)
  .catch(error => {
    console.log(`ERROR: Axe injection failed (${error.message})`);
    data.prevented = true;
    data.error = 'ERROR: axe injection failed';
  });
  // If the injection succeeded:
  if (! data.prevented) {
    // Get the data on the elements violating the specified axe-core rules.
    const axeOptions = {
      resultTypes: ['violations']
    };
    if (rules.length) {
      axeOptions.runOnly = rules;
    }
    else {
      axeOptions.runOnly = ['experimental', 'best-practice', 'wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'];
    }
    const axeReport = await getAxeResults(page, null, axeOptions)
    .catch(error => {
      console.log(`ERROR: Axe failed (${error.message}'`);
      return '';
    });
    // If the test succeeded:
    const {violations} = axeReport;
    if (violations) {
      // Delete irrelevant properties from the report.
      delete axeReport.inapplicable;
      delete axeReport.passes;
      // Initialize a report.
      data.totals = {
        minor: 0,
        moderate: 0,
        serious: 0,
        critical: 0
      };
      if (withItems) {
        data.details = axeReport;
      }
      // If there were any issues:
      if (incomplete.length || violations.length) {
        // For each incomplete issue:
        incomplete.forEach(issue => {
        });
        // For each rule violated:
        violations.forEach(rule => {
          // For each element violating the rule:
          rule.nodes.forEach(element => {
            // Increment the element count of the impact of its violation.
            data.violations[element.impact]++;
          });
          // If details are required:
          if (withItems) {
            // Add it to the report.
            data.items.push(compactRule(rule));
          }
        });
      }
      data.wholeReport = axeReport;
    }
    // Otherwise, i.e. if the test failed:
    else {
      // Report this.
      data.prevented = true;
      data.error = 'ERROR: axe failed';
      console.log('ERROR: axe failed');
    }
  }
  // Return the result.
  return {result: data};
};
