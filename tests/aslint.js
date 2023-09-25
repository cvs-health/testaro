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
  console.log(`options:\n${JSON.stringify(options, null, 2)}`);
  // Initialize the report.
  let data = {};
  // Get the ASLint runner and bundle scripts.
  const aslintRunner = await fs.readFile(`${__dirname}/../procs/aslint.js`, 'utf8');
  const aslintBundle = await fs.readFile(
    `${__dirname}/../node_modules/aslint-testaro/aslint.bundle.js`, 'utf8'
  );
  // Get the nonce, if any.
  const {scriptNonce} = options;
  // Inject the ASLint bundle and runner into the page.
  console.log('About to inject');
  await page.evaluate(args => {
    const {scriptNonce, aslintBundle, aslintRunner} = args;
    // Bundle.
    const bundleEl = document.createElement('script');
    bundleEl.id = 'aslintBundle';
    console.log(`scriptNonce is ${scriptNonce}`);
    if (scriptNonce) {
      bundleEl.nonce = scriptNonce;
      console.log(`Added nonce ${scriptNonce} to bundle`);
    }
    bundleEl.textContent = aslintBundle;
    document.head.insertAdjacentElement('beforeend', bundleEl);
    console.log('Injected bundle');
    // Runner.
    const runnerEl = document.createElement('script');
    if (scriptNonce) {
      runnerEl.nonce = scriptNonce;
      console.log(`Added nonce ${scriptNonce} to runner`);
    }
    runnerEl.textContent = aslintRunner;
    document.body.insertAdjacentElement('beforeend', runnerEl);
    console.log('Injected runner');
  }, {scriptNonce, aslintBundle, aslintRunner})
  .catch(error => {
    console.log(`ERROR: ASLint injection failed (${error.message.slice(0, 400)})`);
    data.prevented = true;
    data.error = 'ERROR: ASLint injection failed';
  });
  // If the injection succeeded:
  if (! data.prevented) {
    console.log('Injection succeeded');
    // Wait for the test results.
    const reportLoc = page.locator('#aslintResult');
    console.log('About to wait for reportLoc to be attached');
    await reportLoc.waitFor({
      state: 'attached',
      timeout: 10000
    });
    console.log('It got attached');
    // Get them.
    const report = await reportLoc.textContent();
    // Populate the tool report.
    data = JSON.parse(report);
    // Delete irrelevant properties from the tool report details.
    if (data.rules) {
      Object.keys(data.rules).forEach(ruleID => {
        if (data.rules[ruleID].status.type === 'passed') {
          delete data.rules[ruleID];
        }
      });
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
