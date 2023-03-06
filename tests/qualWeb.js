/*
  qualWeb
  This test implements the QualWeb ruleset for accessibility.
*/
// IMPORTS
const {QualWeb, generateEARLReport} = require('@qualweb/core');
// CONSTANTS
const qualweb = new QualWeb({});
const clusterOptions = {
  timeout: 20
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
      timeout: 20,
      maxParallelCrawls: 1,
      logging: true
    },
    execute: {
      wappalyzer: true,
      act: true,
      wcag: true,
      bp: true,
      counter: true
    },
    'act-rules': {
      exclude: [],
      levels: ['A', 'AA', 'AAA'],
      principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
    },
    'wcag-techniques': {
      exclude: [],
      levels: ['A', 'AA', 'AAA'],
      principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
    },
    'best-practices': {
      exclude: []
    }
  };
  if (rules) {
    qualwebOptions['act-rules'].rules = rules;
  }
  // Get the report.
  const reports = await qualweb.evaluate(qualwebOptions);
  // Stop the QualWeb core engine.
  await qualweb.stop();
  // Specify the EARL options.
  const earlOptions = {};
  // Get the EARL report.
  const earlReports = generateEARLReport(reports, earlOptions);
  // Add the reports to the data.
  data.reports = reports;
  data.earlReports = earlReports;
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
  return {result: data};
};
