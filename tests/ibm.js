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
const {getCompliance, getDiffResults} = require('accessibility-checker');
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
const trimResult = (actReport, withItems, rules) => {
  const {result, data} = actReport;
  if (result && result.report && result.report.summary) {
    limitRuleTotals(result, rules);
    const totals = result.report.summary.counts;
    if (totals) {
      result.totals = totals;
      if (withItems) {
        if (rules && Array.isArray(rules) && rules.length) {
          result.items = report.report.results.filter(item => rules.includes(item.ruleId));
        }
        else {
          result.items = report.report.results;
        }
        result.items.forEach(item => {
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
  // Return the result, trimmed.
  return result;
};
// Performs the IBM tests and returns the result.
const doTest = async (content, withItems, timeLimit, rules) => {
  // Conduct the test and get the result.
  const data = {};
  let result = {};
  try {
    result = await run(content, timeLimit);
  }
  catch(error) {
    const message = `Act failed ${error.message.slice(0, 200)}`;
    console.log(message);
    data.prevented = true;
    data.error = message;
  }
  // If the act crashed or timed out:
  if (data.prevented) {
    // Report this.
    return {
      data: {
        prevented: true,
        error: 'ERROR: Act failed or timed out'
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
      console.log('No result files created');
    }
    // Return the act report.
    const trimmedResult = trimResult(report, withItems, rules);
    return {
      data,
      result: trimmedResult
    };
  }
};
// Returns results of an IBM test.
exports.reporter = async (page, options) => {
  const {withItems, withNewContent, rules} = options;
  const contentType = withNewContent ? 'new' : 'existing';
  console.log(`>>>>>> Content type: ${contentType}`);
  const data = {};
  const timeLimit = 30;
  const typeContent = contentType === 'existing' ? await page.content() : await page.url();
  try {
    const actReport = await doTest(typeContent, withItems, timeLimit, rules);
    const {data, result} = actReport;
    if (data && data.prevented) {
      const message = `ERROR: Act failed or timed out at ${timeLimit} seconds`;
      console.log(message);
      data.error = data.error ? `${data.error}; ${message}` : message;
      return {
        data,
        result
      }
    }
    else {
      return actReport;
    }
  }
  catch(error) {
    const message = `ERROR: Act crashed ${error.message.slice(0, 200)}`;
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
