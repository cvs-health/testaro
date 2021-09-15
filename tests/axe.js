const {injectAxe, getViolations} = require('axe-playwright');
// Conducts and reports an Axe test.
exports.reporter = async (page, withItems, rules = []) => {
  // Inject axe-core into the page.
  await injectAxe(page);
  // Initialize the report.
  const data = {};
  // Get the data on the elements violating the specified axe-core rules.
  const axeOptions = {};
  if (rules.length) {
    axeOptions.runOnly = rules;
  }
  const axeReport = await getViolations(page, null, axeOptions)
  .catch(() => {
    console.log('ERROR: Axe failed');
    return '';
  });
  // If the test succeeded:
  if (Array.isArray(axeReport)) {
    // Initialize a report.
    data.warnings = 0;
    data.violations = {
      minor: 0,
      moderate: 0,
      serious: 0,
      critical: 0
    };
    if (withItems) {
      data.items = [];
    }
    // If there were any violations:
    if (axeReport.length) {
      // FUNCTION DEFINITIONS START
      // Compacts a check violation.
      const compactCheck = checkObj => {
        return {
          check: checkObj.id,
          description: checkObj.message,
          impact: checkObj.impact
        };
      };
      // Compacts a violating element.
      const compactViolator = elObj => {
        const out = {
          selector: elObj.target[0],
          impact: elObj.impact
        };
        if (elObj.any && elObj.any.length) {
          out['must pass any of'] = elObj.any.map(checkObj => compactCheck(checkObj));
        }
        if (elObj.none && elObj.none.length) {
          out['must pass all of'] = elObj.none.map(checkObj => compactCheck(checkObj));
        }
        return out;
      };
      // Compacts a violated rule.
      const compactRule = rule => {
        const out = {
          rule: rule.id,
          description: rule.description,
          impact: rule.impact,
          elements: {}
        };
        if (rule.nodes && rule.nodes.length) {
          out.elements = rule.nodes.map(el => compactViolator(el));
        }
        return out;
      };
      // FUNCTION DEFINITIONS END
      // For each rule violated:
      axeReport.forEach(rule => {
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
  }
  // Otherwise, i.e. if the test failed:
  else {
    // Report this.
    data.result = 'ERROR: Axe failed.';
  }
  // Reload the page to undo the DOM changes made by Axe.
  await page.reload().catch(error => {
    console.log(error.message, error.stack);
  });
  // Return the result.
  return {result: data};
};
