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
  // Get the ASLint runner and bundle scripts.
  const aslintRunner = await fs.readFile(`${__dirname}/../procs/aslint.js`, 'utf8');
  const aslintBundle = await fs.readFile(
    `${__dirname}/../node_modules/aslint-testaro/aslint.bundle.js`, 'utf8'
  );
  // Get the nonce, if any.
  const cspNonce = options.act && options.act.cspNonce;
  // Inject the ASLint bundle and runner into the page.
  await page.evaluate(args => {
    const {cspNonce, aslintBundle, aslintRunner} = args;
    // Bundle.
    const bundleEl = document.createElement('script');
    bundleEl.id = 'aslintBundle';
    if (cspNonce) {
      bundleEl.nonce = cspNonce;
    }
    bundleEl.textContent = aslintBundle;
    document.head.insertAdjacentElement('beforeend', bundleEl);
    // Runner.
    const runnerEl = document.createElement('script');
    if (cspNonce) {
      runnerEl.nonce = cspNonce;
    }
    runnerEl.textContent = aslintRunner;
    document.body.insertAdjacentElement('beforeend', runnerEl);
  }, {cspNonce, aslintBundle, aslintRunner})
  .catch(error => {
    console.log(`ERROR: ASLint injection failed (${error.message.slice(0, 400)})`);
    data.prevented = true;
    data.error = 'ERROR: ASLint injection failed';
  });
  // If the injection succeeded:
  if (! data.prevented) {
    // Get the test results.
    console.log('About to get test results');
    const reportLoc = page.locator('#aslintResult');
    await reportLoc.waitFor({
      state: 'attached',
      timeout: 3000
    });
    // If there were any:
    // if (reportExists) {
      console.log('Results exist');
      // Get them.
      const report = await reportLoc.textContent();
      console.log('Got report');
      // Initialize the result.
      data.totals = {
        stuff: 0
      };
      data.details = report;
      // Populate the totals.
      // Delete irrelevant properties from the report details.
    // }
    // Otherwise, i.e. if the test failed:
    /*
    else {
      // Report this.
      data.prevented = true;
      data.error = 'ERROR: ASLint failed';
      console.log('ERROR: ASLint failed');
    }
    */
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
