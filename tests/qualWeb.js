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
  // Start the QualWeb core engine.
  await qualWeb.start(clusterOptions);
  // Specify the invariant test options.
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
      counter: true
    }
  };
  // Specify a URL or provide the content.
  if (withNewContent) {
    qualWebOptions.url = page.url();
  }
  else {
    qualWebOptions.html = await page.content();
  }
  // Specify which rules to test for.
  const actSpec = rules ? rules.find(typeRules => typeRules.startsWith('act:')) : null;
  const wcagSpec = rules ? rules.find(typeRules => typeRules.startsWith('wcag:')) : null;
  const bestSpec = rules ? rules.find(typeRules => typeRules.startsWith('best:')) : null;
  if (actSpec) {
    if (actSpec === 'act:') {
      qualWebOptions.execute.act = false;
    }
    else {
      const actRules = actSpec.slice(4).split(',').map(num => `QW-ACT-R${num}`);
      qualWebOptions['act-rules'] = {rules: actRules};
      qualWebOptions.execute.act = true;
    }
  }
  else {
    qualWebOptions['act-rules'] = {
      levels: ['A', 'AA', 'AAA'],
      principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
    };
    qualWebOptions.execute.act = true;
  }
  if (wcagSpec) {
    if (wcagSpec === 'wcag:') {
      qualWebOptions.execute.wcag = false;
    }
    else {
      const wcagTechniques = wcagSpec.slice(5).split(',').map(num => `QW-WCAG-T${num}`);
      qualWebOptions['wcag-techniques'] = {techniques: wcagTechniques};
      qualWebOptions.execute.wcag = true;
    }
  }
  else {
    qualWebOptions['wcag-techniques'] = {
      levels: ['A', 'AA', 'AAA'],
      principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
    };
    qualWebOptions.execute.wcag = true;
  }
  if (bestSpec) {
    if (bestSpec === 'best:') {
      qualWebOptions.execute.bp = false;
    }
    else {
      const bestPractices = bestSpec.slice(5).split(',').map(num => `QW-BP${num}`);
      qualWebOptions['best-practices'] = {bestPractices};
      // qualWebOptions.execute.bp = true;
      // Temporarily disable best practices, because they crash QualWeb.
      qualWebOptions.execute.bp = false;
    }
  }
  else {
    // qualWebOptions.execute.bp = true;
    // Temporarily disable best practices, because they crash QualWeb.
    qualWebOptions.execute.bp = false;
  }
  // Get the report.
  let reports = await qualWeb.evaluate(qualWebOptions);
  // Remove the copy of the DOM from it.
  let report = reports[withNewContent ? qualWebOptions.url : 'customHtml'];
  if (report && report.system && report.system.page && report.system.page.dom) {
    delete report.system.page.dom;
    // For each test section of the report:
    const {modules} = report;
    if (modules) {
      for (const section of ['act-rules', 'wcag-techniques', 'best-practices']) {
        if (qualWebOptions[section]) {
          if (modules[section]) {
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
        }
      }
    }
    else {
      report.prevented = true;
      report.error = 'ERROR: No modules';
    }
  }
  else {
    report.prevented = true;
    report.error = 'ERROR: No DOM';
  }
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
  return {result: report};
};
