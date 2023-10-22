/*
  ibm
  This test implements the IBM Equal Access ruleset for accessibility.
  The 'withNewContent' argument determines whether the test package should be
  given the URL of the page to be tested (true) or the page content (false).

  This test depends on aceconfig.js.

  This tool is compatible with Windows only if the accessibility-checker package
  is revised. See README.md for details.
*/

// IMPORTS

const fs = require('fs').promises;
// Scanner. Importing and executing 'close' crashed the Node process.
const {getCompliance} = require('accessibility-checker');

// FUNCTIONS

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
const trimActReport = (actReport, withItems, rules) => {
  if (actReport && actReport.report && actReport.report.summary) {
    limitRuleTotals(actReport, rules);
    const totals = actReport.report.summary.counts;
    if (totals) {
      actReport.totals = totals;
      if (withItems) {
        if (rules && Array.isArray(rules) && rules.length) {
          actReport.items = actReport.report.results.filter(item => rules.includes(item.ruleId));
        }
        else {
          actReport.items = actReport.report.results;
        }
        actReport.items.forEach(item => {
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
      data.error = 'ERROR: No totals reported';
    }
  }
  else {
    data.prevented = true;
    data.error = 'ERROR: No summary reported';
  }
  // Return the act report, trimmed.
  return actReport;
};
// Performs the IBM tests and returns the result.
const doTest = async (content, withItems, timeLimit, rules) => {
  // Conduct the test and get the result.
  const data = {};
  try {
    const runReport = await run(content, timeLimit);
    const actReport = runReport && runReport.report;
    // Delete any report files.
    try {
      const reportNames = await fs.readdir('results');
      for (const reportName of reportNames) {
        await fs.rm(`results/${reportName}`);
      }
    }
    catch(error) {
      console.log('No result files created');
    }
    // Return a trimmed act report.
    const trimmedReport = trimActReport(actReport, withItems, rules);
    return {
      data,
      result: trimmedReport
    };
  }
  catch(error) {
    const message = `Act failed ${error.message.slice(0, 200)}`;
    console.log(message);
    data.prevented = true;
    data.error = message;
    return {
      data,
      result: {}
    };
  };
};
// Performs ibm tests and returns an act report.
exports.reporter = async (page, options) => {
  const {withItems, withNewContent, rules} = options;
  const contentType = withNewContent ? 'new' : 'existing';
  console.log(`>>>>>> Content type: ${contentType}`);
  const timeLimit = 30;
  const typeContent = contentType === 'existing' ? await page.content() : await page.url();
  try {
    const actReport = await doTest(typeContent, withItems, timeLimit, rules);
    const {data, result} = actReport;
    if (data && data.prevented) {
      const message = `ERROR: Act failed or timed out at ${timeLimit} seconds`;
      console.log(message);
      data.error = data.error ? `${data.error}; ${message}` : message;
    }
    return {
      data,
      result
    };
  }
  catch(error) {
    const message = `ERROR: Act crashed (${error.message.slice(0, 200)})`;
    console.log(message);
    return {
      data: {
        prevented: true,
        error: message
      },
      result: {}
    }
  };
};
