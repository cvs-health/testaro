/*
  ibm
  This test implements the IBM Equal Access ruleset for accessibility.
  The 'withNewContent' argument determines whether the test package should be
  given the URL of the page to be tested (true), should be given the page content
  (false), or should test in both ways (omitted).

  Before using this test, you must:
    0. Create a file named aceconfig.js.
    1. Locate that file in the directory in which you call Testaro.
    2. Populate that file with this content:

      module.exports = {
        reportLevels: [
          'violation',
          'recommendation'
        ]
      };
*/
// Import required modules.
const fs = require('fs').promises;
const {getCompliance} = require('accessibility-checker');
// Runs the IBM test.
const run = async content => {
  const nowLabel = (new Date()).toISOString().slice(0, 19);
  // Return the result of a test.
  const report = await getCompliance(content, nowLabel);
  return report;
};
// Reports the result of an IBM test.
const report = (result, withItems) => {
  const data = {};
  if (result) {
    data.totals = result.report.summary.counts;
    if (withItems) {
      data.items = result.report.results;
      data.items.forEach(item => {
        delete item.apiArgs;
        delete item.category;
        delete item.ignored;
        delete item.messageArgs;
        delete item.reasonId;
        delete item.ruleTime;
        delete item.value;
      });
    }
  }
  else {
    data.error = 'ERROR: ibm test failed';
  }
  return data;
};
// Performs an IBM test.
const doTest = async (content, withItems, timeLimit) => {
  // Start a timeout clock.
  let timeoutID;
  const wait = new Promise(resolve => {
    timeoutID = setTimeout(() => {
      resolve('');
    }, 1000 * timeLimit);
  });
  // Conduct and report the test.
  const result = run(content);
  // Wait for the report until the time limit expires.
  const resultIfFast = await Promise.race([result, wait]);
  // Delete the report files.
  try {
    const reportNames = await fs.readdir('results');
    for (const reportName of reportNames) {
      await fs.rm(`results/${reportName}`);
    }
  }
  catch(error) {
    console.log('ibm test created no result files.');
  }
  // Return the result.
  if (resultIfFast) {
    clearTimeout(timeoutID);
    const typeResult = report(result, withItems);
    return typeResult;
  }
  else {
    console.log('ERROR: getting ibm test report took too long');
    return 'ERROR: getting ibm test report took too long';
  }
};
// Returns results of one or two IBM tests.
exports.reporter = async (page, withItems, withNewContent) => {
  // If a test with existing content is to be performed:
  const result = {};
  if (! withNewContent) {
    const timeLimit = 15;
    const typeContent = await page.content();
    result.content = await doTest(typeContent, withItems, timeLimit);
  }
  // If a test with new content is to be performed:
  if ([true, undefined].includes(withNewContent)) {
    const timeLimit = 20;
    const typeContent = page.url();
    result.url = await doTest(typeContent, withItems, timeLimit);
  }
  return {result};
};
