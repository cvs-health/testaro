/*
  qualWeb
  This test implements the QualWeb ruleset for accessibility.
*/
// IMPORTS
const {QualWeb} = require('@qualweb/core');
// CONSTANTS
const qualWeb = new QualWeb({});
const clusterOptions = {
  timeout: 25 * 1000
};
// FUNCTIONS
// Conducts and reports a QualWeb test.
exports.reporter = async (page, options) => {
  const {withNewContent, rules} = options;
  // Initialize the report.
  // Start the QualWeb core engine.
  await qualWeb.start(clusterOptions);
  // Specify the test options.
  const qualWebOptions = {
    log: {
      console: true
    },
    crawlOptions: {
      maxDepth: 0,
      maxUrls: 1,
      timeout: 25 * 1000,
      maxParallelCrawls: 1,
      logging: true
    },
    execute: {
      wappalyzer: ! rules,
      act: true,
      wcag: ! rules,
      bp: ! rules,
      counter: ! rules
    }
  };
  if (withNewContent) {
    qualWebOptions.url = page.url();
  }
  else {
    qualWebOptions.html = await page.content();
  }
  const arRules = rules
    ? rules.filter(rule => rule.startsWith('ar:')).map(rule => rule.slice(3))
    : [];
  const wtRules = rules
    ? rules.filter(rule => rule.startsWith('wt:')).map(rule => rule.slice(3))
    : [];
  const bpRules = rules
    ? rules.filter(rule => rule.startsWith('bp:')).map(rule => rule.slice(3))
    : [];
  if (arRules.length) {
    qualWebOptions['act-rules'] = {rules: arRules};
  }
  else {
    qualWebOptions['act-rules'] = {
      levels: ['A', 'AA', 'AAA'],
      principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
    };
  }
  if (wtRules.length) {
    qualWebOptions['wcag-techniques'] = {rules: wtRules};
  }
  else {
    qualWebOptions['wcag-techniques'] = {
      levels: ['A', 'AA', 'AAA'],
      principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
    };
  }
  if (bpRules.length) {
    qualWebOptions['best-practices'] = {bestPractices: bpRules};
  }
  else {
    qualWebOptions['best-practices'] = {
      bestPractices: ['QW-BP28']
    };
  }
  console.log(JSON.stringify(qualWebOptions, null, 2));
  // Get the report.
  let reports = await qualWeb.evaluate(qualWebOptions);
  // Remove the copy of the DOM from it.
  let report = reports[withNewContent ? qualWebOptions.url : 'customHtml'];
  if (report && report.system && report.system.page && report.system.page.dom) {
    delete report.system.page.dom;
    // For each section of the report:
    const sections = ['act-rules'];
    if (! rules) {
      sections.push('wcag-techniques', 'best-practices');
    }
    sections.forEach(section => {
      // For each test:
      const {modules} = report;
      if (modules && modules[section]) {
        const {assertions} = modules[section];
        if (assertions) {
          const ruleIDs = Object.keys(assertions);
          ruleIDs.forEach(ruleID => {
            // Remove passing results.
            const ruleAssertions = assertions[ruleID];
            const {metadata} = ruleAssertions;
            if (metadata) {
              if (metadata.warning === 0 && metadata.failed === 0) {
                delete assertions[ruleID];
              }
              else {
                if (ruleAssertions.results) {
                  ruleAssertions.results = ruleAssertions.results.filter(
                    result => result.verdict !== 'passed'
                  );
                }
              }
            }
            // Shorten long HTML codes of elements.
            const {results} = ruleAssertions;
            results.forEach(result => {
              const {elements} = result;
              if (elements && elements.length) {
                elements.forEach(element => {
                  if (element.htmlCode && element.htmlCode.length > 700) {
                    element.htmlCode = `${element.htmlCode.slice(0, 700)} …`;
                  }
                });
              }
            });
          });
        }
        else {
          report.prevented = true;
          report.error = 'ERROR: No assertions';
        }
      }
      else {
        report.prevented = true;
        report.error = `ERROR: No ${section} section`;
      }
    });
    // Stop the QualWeb core engine.
    await qualWeb.stop();
    // Return the result.
    try {
      JSON.stringify(report);
    }
    catch(error) {
      console.log(`ERROR: qualWeb result cannot be made JSON (${error.message})`);
      report = {
        prevented: true,
        error: `ERROR: qualWeb result cannot be made JSON (${error.message})`
      };
    }
  }
  else {
    report = {
      prevented: true,
      error: 'ERROR: qualWeb evaluation failed to produce standard output'
    };
  }
  return {result: report};
};
