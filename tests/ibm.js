/*
  ibm
  This test implements the IBM Equal Access ruleset for accessibility.
  The 'withNewContent' argument determines whether the test package should be
  given the URL of the page to be tested (true), should be given the page content
  (false), or should test in both ways (omitted).

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
  const ibmReport = getCompliance(content, nowLabel)
  .catch(error => {
    console.log(`ERROR: getCompliance failed (${error.message.replace(/\n+/s, '')}).`);
    return null;
  });
  const result = await Promise.race([ibmReport, timeout]);
  clearTimeout(timeoutID);
  return result;
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
// Returns results of one or two IBM tests.
exports.reporter = async (page, withItems, withNewContent, rules) => {
  let contentType = 'both';
  if (withNewContent) {
    contentType = 'new';
  }
  else if (withNewContent === false) {
    contentType = 'existing';
  }
  console.log(`>>>>>> Content type: ${contentType}`);
  // If a test with existing content is to be performed:
  const result = {};
  const timeLimit = 20;
  if (['existing', 'both'].includes(contentType)) {
    try {
      console.log('>>>>>> With existing content');
      const typeContent = await page.content();
      result.content = await doTest(typeContent, withItems, timeLimit, rules);
      if (result.content.prevented) {
        result.prevented = true;
        console.log(`ERROR: Getting ibm test report from page timed out at ${timeLimit} seconds`);
      }
    }
    catch(error) {
      result.prevented = true;
      console.log(`ERROR: ibm test on page crashed with error ${error.message.slice(0, 200)}`);
    }
  }
  // If a test with new content is to be performed:
  if (['new', 'both'].includes(contentType)) {
    try {
      console.log('>>>>>> With new content');
      const typeContent = page.url();
      result.url = await doTest(typeContent, withItems, timeLimit, rules);
      if (result.url.prevented) {
        result.prevented = true;
        console.log(`ERROR: Getting ibm test report from URL timed out at ${timeLimit} seconds`);
      }
    }
    catch(error) {
      result.prevented = true;
      console.log(`ERROR: ibm test on URL crashed with error ${error.message.slice(0, 200)}`);
    }
  }
  // Return the result. Execution of close() crashed the Node process.
  return {result};
};
