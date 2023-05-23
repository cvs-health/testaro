/*
  ibm
  This test implements the IBM Equal Access ruleset for accessibility.
  The 'withNewContent' argument determines whether the test package should be
  given the URL of the page to be tested (true) or the page content (false).
  
  This test depends on aceconfig.js.

  This test is compatible with Windows only if the accessibility-checker package
  is revised. See README.md for details.
*/
// Import required modules.
const fs = require('fs').promises;
// Scanner. Importing and executing 'close' crashed the Node process.
const {getCompliance} = require('accessibility-checker');
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
  try {
    const ibmReport = getCompliance(content, nowLabel);
    const result = await Promise.race([ibmReport, timeout]);
    clearTimeout(timeoutID);
    return result;
  }
  catch(error) {
    console.log(
      `ERROR: getCompliance failed (${error.message.replace(/\s+/g, ' ').slice(0, 200)}).`
    );
    return null;
  }
};
// Revises report totals for any rule limitation.
const limitRuleTotals = (report, rules) => {
  if (rules && Array.isArray(rules) && rules.length) {
    const totals = report.report.summary.counts;
    const items = report.report.results;
    totals.violation = totals.recommendation = 0;
    items.forEach(item => {
      if (rules.includes(item.ruleId)) {
        totals[item.level]++;
      }
    });
  }
};
// Trims an IBM report.
const trimReport = (report, withItems, rules) => {
  const data = {};
  if (report && report.report && report.report.summary) {
    limitRuleTotals(report, rules);
    const totals = report.report.summary.counts;
    if (totals) {
      data.totals = totals;
      if (withItems) {
        if (rules && Array.isArray(rules) && rules.length) {
          data.items = report.report.results.filter(item => rules.includes(item.ruleId));
        }
        else {
          data.items = report.report.results;
        }
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
// Performs an IBM test and returns the result.
const doTest = async (content, withItems, timeLimit, rules) => {
  // Conduct the test and get the result.
  let report;
  try {
    report = await run(content, timeLimit);
  }
  catch(error) {
    console.log(`ibm test failed ${error.message.slice(0, 100)}...`);
    report = null;
  }
  // If the test did not crash or time out:
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
    const typeReport = trimReport(report, withItems, rules);
    return typeReport;
  }
  else {
    return {
      prevented: true,
      error: 'ERROR: ibm test failed or timed out'
    };
  }
};
// Returns results of an IBM test.
exports.reporter = async (page, withItems, withNewContent, rules) => {
  const contentType = withNewContent ? 'new' : 'existing';
  console.log(`>>>>>> Content type: ${contentType}`);
  let result;
  const timeLimit = 30;
  const typeContent = contentType === 'existing' ? await page.content() : await page.url();
  try {
    result = await doTest(typeContent, withItems, timeLimit, rules);
    if (result.prevented) {
      console.log(`ERROR: Getting ibm test report timed out at ${timeLimit} seconds`);
    }
  }
  catch(error) {
    result.prevented = true;
    console.log(`ERROR: ibm test crashed with error ${error.message.slice(0, 200)}`);
  }
  // Return the result. Execution of close() crashed the Node process.
  return {result};
};
