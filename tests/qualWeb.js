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
exports.reporter = async (page, withNewContent, rules = null) => {
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
    },
    'act-rules': {
      exclude: []
    }
  };
  if (withNewContent) {
    qualWebOptions.url = page.url();
  }
  else {
    qualWebOptions.html = await page.content();
  }
  if (rules) {
    qualWebOptions['act-rules'].rules = rules;
  }
  else {
    qualWebOptions['act-rules'].levels = ['A', 'AA', 'AAA'];
    qualWebOptions['act-rules'].principles = [
      'Perceivable', 'Operable', 'Understandable', 'Robust'
    ];
  }
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
