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
exports.reporter = async (page, detailLevel, rules = []) => {
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
      resultTypes: ['violations', 'incomplete']
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
    const {inapplicable, passes, incomplete, violations} = axeReport;
    if (violations) {
      // Initialize the result.
      data.totals = {
        rulesNA: 0,
        rulesPassed: 0,
        rulesWarned: 0,
        rulesViolated: 0,
        warnings: {
          minor: 0,
          moderate: 0,
          serious: 0,
          critical: 0
        },
        violations: {
          minor: 0,
          moderate: 0,
          serious: 0,
          critical: 0
        }
      };
      data.details = axeReport;
      // Populate the totals.
      const {totals} = data;
      totals.rulesNA = inapplicable.length;
      totals.rulesPassed = passes.length;
      incomplete.forEach(rule => {
        totals.rulesWarned++;
        rule.nodes.forEach(node => {
          totals.warnings[node.impact]++;
        });
      });
      violations.forEach(rule => {
        totals.rulesViolated++;
        rule.nodes.forEach(node => {
          totals.violations[node.impact]++;
        });
      });
      // Delete irrelevant properties from the report details.
      const irrelevants = ['inapplicable', 'passes', 'incomplete', 'violations']
      .slice(0, 4 - detailLevel);
      irrelevants.forEach(irrelevant => {
        delete axeReport[irrelevant];
      });
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
