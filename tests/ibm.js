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
const {getCompliance, close} = require('accessibility-checker');
// Runs the IBM test.
const run = async (content, timeLimit) => {
  const nowLabel = (new Date()).toISOString().slice(0, 19);
  // Start the timeout clock.
  let timeoutID;
  const timeout = new Promise(resolve => {
    timeoutID = setTimeout(() => {
      resolve(null);
    }, 1000 * timeLimit);
  });
  // Return the result of the test, or null if it timed out.
  const ibmReport = getCompliance(content, nowLabel)
  .catch(error => {
    console.log(`ERROR: getCompliance failed (${error.message.replace(/\n+/s, '')}).`);
    return null;
  });
  const result = await Promise.race([ibmReport, timeout]);
  clearTimeout(timeoutID);
  return result;
};
// Trims an IBM report.
const trimReport = (report, withItems) => {
  const data = {};
  if (report && report.report && report.report.summary) {
    const totals = report.report.summary.counts;
    if (totals) {
      data.totals = totals;
      if (withItems) {
        data.items = report.report.results;
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
      data.prevented = true;
      data.error = 'ERROR: ibm test delivered no totals';
    }
  }
  else {
    data.prevented = true;
    data.error = 'ERROR: ibm test delivered no report summary';
  }
  return data;
};
// Performs an IBM test and return the result.
const doTest = async (content, withItems, timeLimit) => {
  // Conduct the test and get the result.
  const report = await run(content, timeLimit);
  // If the test did not time out:
  if (report) {
    // Delete any report files.
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
    const typeReport = trimReport(report, withItems);
    return typeReport;
  }
  else {
    return {
      prevented: true,
      error: 'ERROR: getting ibm test report took too long'
    };
  }
};
// Returns results of one or two IBM tests.
exports.reporter = async (page, withItems, withNewContent) => {
  // If a test with existing content is to be performed:
  const result = {};
  if (! withNewContent) {
    const timeLimit = 20;
    const typeContent = await page.content();
    result.content = await doTest(typeContent, withItems, timeLimit);
    if (result.content.prevented) {
      result.prevented = true;
      console.log(`ERROR: Getting ibm test report from page timed out at ${timeLimit} seconds`);
    }
  }
  // If a test with new content is to be performed:
  if ([true, undefined].includes(withNewContent)) {
    const timeLimit = 20;
    const typeContent = page.url();
    result.url = await doTest(typeContent, withItems, timeLimit);
    if (result.url.prevented) {
      result.prevented = true;
      console.log(`ERROR: Getting ibm test report from URL timed out at ${timeLimit} seconds`);
    }
  }
  await close();
  return {result};
};
