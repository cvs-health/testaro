/*
  qualWeb
  This test implements the QualWeb ruleset for accessibility.
*/
// IMPORTS
const {QualWeb} = require('@qualweb/core');
// CONSTANTS
const qualweb = new QualWeb({});
const clusterOptions = {
  timeout: 25 * 1000
};
// FUNCTIONS
// Conducts and reports a QualWeb test.
exports.reporter = async (page, rules = null) => {
  // Initialize the report.
  let data = {};
  // Start the QualWeb core engine.
  await qualweb.start(clusterOptions);
  // Specify the page.
  const html = await page.content();
  const qualwebOptions = {
    html,
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
  if (rules) {
    qualwebOptions['act-rules'].rules = rules;
  }
  else {
    qualwebOptions['act-rules'].levels = ['A', 'AA', 'AAA'];
    qualwebOptions['act-rules'].principles = [
      'Perceivable', 'Operable', 'Understandable', 'Robust'
    ];
  }
  // Get the report.
  const reports = await qualweb.evaluate(qualwebOptions);
  // Prepare to trim its ACT rules and WCAG Techniques section.
  delete reports.customHtml.system.page.dom;
  ['act-rules', 'wcag-techniques', 'best-practices'].forEach(module => {
    const {assertions} = reports.customHtml.modules[module];
    const ruleIDs = Object.keys(assertions);
    ruleIDs.forEach(ruleID => {
      // Remove passing customHtml results.
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
  });
  // Stop the QualWeb core engine.
  await qualweb.stop();
  // Return the result.
  try {
    JSON.stringify(data);
  }
  catch(error) {
    console.log(`ERROR: qualWeb result cannot be made JSON (${error.message})`);
    data = {
      prevented: true,
      error: `ERROR: qualWeb result cannot be made JSON (${error.message})`
    };
  }
  return {result: reports};
};
