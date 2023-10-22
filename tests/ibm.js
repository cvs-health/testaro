/*
  ibm
  This test implements the IBM Equal Access ruleset for accessibility.
  The 'withNewContent' argument determines whether the test package should be
  given the URL of the page to be tested (true) or the page content (false).

  This test depends on aceconfig.js.

  This tool is compatible with Windows only if the accessibility-checker package
  is revised. See README.md for details.
*/
// Import required modules.
const fs = require('fs').promises;
// Scanner. Importing and executing 'close' crashed the Node process.
const {getCompliance} = require('accessibility-checker');
// Runs the IBM test and returns the result.
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
// Revises act-report totals for any rule limitation.
const limitRuleTotals = (actReport, rules) => {
  if (rules && Array.isArray(rules) && rules.length) {
    const totals = actReport.report.summary.counts;
    const items = actReport.report.results;
    totals.violation = totals.recommendation = 0;
    items.forEach(item => {
      if (rules.includes(item.ruleId)) {
        totals[item.level]++;
      }
    });
  }
};
// Trims an IBM report.
const trimReport = (actReport, withItems, rules) => {
  const data = {};
  if (actReport && actReport.report && actReport.report.summary) {
    limitRuleTotals(actReport, rules);
    const totals = actReport.report.summary.counts;
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
// Performs the IBM tests and returns the result.
const doTest = async (content, withItems, timeLimit, rules) => {
  // Conduct the test and get the result.
  const data = {};
  let report;
  try {
    report = await run(content, timeLimit);
  }
  catch(error) {
    const message = `ibm test failed ${error.message.slice(0, 200)}`;
    console.log(message);
    data.prevented = true;
    data.error = message;
    report = {};
  }
  // If the act crashed or timed out:
  if (data.prevented) {
    // Report this.
    return {
      data: {
        prevented: true,
        error: 'ERROR: ibm test failed or timed out'
      },
      result: {}
    };
  }
  // Otherwise, i.e. if the act succeeded:
  else {
    // Delete any report files.
    try {
      const reportNames = await fs.readdir('results');
      for (const reportName of reportNames) {
        await fs.rm(`results/${reportName}`);
      }
    }
    catch(error) {
      console.log('No ibm result files created');
    }
    // Return the result.
    const typeReport = trimReport(report, withItems, rules);
    return {
      data,
      result: typeReport
    };
  }
};
// Returns results of an IBM test.
exports.reporter = async (page, options) => {
  const {withItems, withNewContent, rules} = options;
  const contentType = withNewContent ? 'new' : 'existing';
  console.log(`>>>>>> Content type: ${contentType}`);
  const data = {};
  let result = {};
  const timeLimit = 30;
  const typeContent = contentType === 'existing' ? await page.content() : await page.url();
  try {
    typeReport = await doTest(typeContent, withItems, timeLimit, rules);
    if (typeReport.data.prevented) {
      console.log(`ERROR: Getting ibm test report timed out at ${timeLimit} seconds`);
    }
  }
  catch(error) {
    data.prevented = true;
    const message = `ERROR: ibm test crashed with error ${error.message.slice(0, 200)}`;
    data.error = message;
    console.log(message);
  }
  // Return the result. Execution of close() crashed the Node process.
  return {
    data,
    result
  };
};
