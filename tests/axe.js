const {injectAxe, getViolations} = require('axe-playwright');
// Conducts and reports an Axe test.
exports.reporter = async (page, withItems, rules = []) => {
  // Inject axe-core into the page.
  await injectAxe(page);
  // Initialize the report.
  const report = {
    warnings: 0,
    violations: {
      minor: 0,
      moderate: 0,
      serious: 0,
      critical: 0
    }
  };
  if (withItems) {
    report.items = [];
  }
  // Get the data on the elements violating the specified axe-core rules.
  const axeOptions = {};
  if (rules.length) {
    axeOptions.runOnly = rules;
  }
  const axeReport = await getViolations(page, null, axeOptions);
  // If there are any such elements:
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
        report.violations[element.impact]++;
      });
      // If details are required:
      if (withItems) {
        // Add it to the report.
        report.items.push(compactRule(rule));
      }
    });
    // Reload the page to undo the DOM changes made by Axe.
    await page.reload();
    // Return the report.
    return {result: report};
  }
  // Otherwise, i.e. if there are no violations:
  else {
    // Reload the page to undo the DOM changes made by Axe.
    await page.reload();
    // Return a success report.
    return {result: 'O.K.'};
  }
};
