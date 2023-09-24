/*
  aslint
  This test implements the ASLint ruleset for accessibility.
*/

// IMPORTS

// Module to handle files.
const fs = require('fs/promises');

// FUNCTIONS

// Conducts and reports an ASLint test.
exports.reporter = async (page, options) => {
  // Initialize the report.
  let data = {};
  // Inject the ASLint runner into the page.
  const aslintRunnerLines = [
    'const options = {',
      'asyncRunner: true,',
      'context: document.documentElement,',
      'includeElementReference: true,',
      'reportFormat: {JSON: true},',
      'watchDomChanges: false',
    '};',
    'document.getElementById("aslintBundle").addEventListener(load, result => {',
      'window',
      '.aslint',
      '.config(options)',
      '.addListener("onValidatorStarted", function () {',
        'console.log("@ Validator started");',
      '})',
      '.addListener("onValidatorComplete", function (error, report) {',
        'console.log("onValidatorComplete", error, report);',
      '})',
      '.addFilter("onBeforeRuleReport", function (report) {',
        'return report;',
      '})',
      '.setRule("turn-me-off", {isSelectedForScanning: false})',
      '.run()',
      '.then(function (result) {',
        'const resultEl = document.createElement("pre");',
        'resultEl.id = "result";',
        'resultEl.textContent = result;',
        'document.body.insertAdjacentElement("beforeend", resultEl);',
      '})',
      '.catch(error => {',
        'console.error("[ASLint error]", error);',
      '});',
    '});',
  ];
  // Inject any nonce and the ASLint runner and bundle scripts into the page.
  const aslintRunnerContent = aslintRunnerLines.join('\n');
  const aslintBundle = await fs.readFile(
    `${__dirname}/../node_modules/aslint-testaro/aslint.bundle.js`, 'utf8'
  );
  const cspNonce = options.act && options.act.cspNonce;
  await page.evaluate(args => {
    const cspNonce = args[0];
    const aslintRunnerContent = args[1];
    const aslintBundle = args[2];
    const runnerScriptEl = document.createElement('script');
    if (cspNonce) {
      runnerScriptEl.nonce = cspNonce;
    }
    runnerScriptEl.textContent = aslintRunnerContent;
    document.body.insertAdjacentElement('beforeend', runnerScriptEl);
    const bundleScriptEl = document.createElement('script');
    bundleScriptEl.id = 'aslintBundle';
    if (cspNonce) {
      bundleScriptEl.nonce = cspNonce;
    }
    bundleScriptEl.textContent = aslintBundle;
    document.head.insertAdjacentElement('beforeend', scriptEl);
  }, [cspNonce, aslintRunnerContent, aslintBundle])
  // await page.addScriptTag({path: `${__dirname}/../node_modules/aslint-testaro/aslint.bundle.js`})
  .catch(error => {
    console.log(`ERROR: ASLint injection failed (${error.message.slice(0, 400)})`);
    data.prevented = true;
    data.error = 'ERROR: ASLint injection failed';
  });
  // If the injection succeeded:
  if (! data.prevented) {
    // Get the test results.
    const reportLoc = await page.locator('#result');
    // If there were any:
    if (reportLoc) {
      // Get them.
      const report = await reportLoc.textContent();
      // Initialize the result.
      data.totals = {
        stuff: 0
      };
      data.details = report;
      // Populate the totals.
      // Delete irrelevant properties from the report details.
    }
    // Otherwise, i.e. if the test failed:
    else {
      // Report this.
      data.prevented = true;
      data.error = 'ERROR: ASLint failed';
      console.log('ERROR: ASLint failed');
    }
  }
  // Return the result.
  try {
    JSON.stringify(data);
  }
  catch(error) {
    console.log(`ERROR: ASLint result cannot be made JSON (${error.message.slice(0, 200)})`);
    data = {
      prevented: true,
      error: `ERROR: ASLint result cannot be made JSON (${error.message.slice(0, 200)})`
    };
  }
  return {result: data};
};
