/*
  © 2023 CVS Health and/or one of its affiliates. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  ed11y
  This test implements the Editoria11y ruleset for accessibility.
*/

// IMPORTS

// Module to handle files.
const fs = require('fs/promises');

// FUNCTIONS

// Conducts and reports the Editoria11y tests.
exports.reporter = async (page, options) => {
  // Add the ed11y script to the page.
  const testScript = await fs.readFile('../ed11y/editoria11y.min.js', 'utf8');
  const results = await page.evaluate(script => {
    const testScript = document.createElement('script');
    testScript.textContent = script;
    document.body.insertAdjacentElement('beforeend', testScript);
    const runScript = document.createElement('script');
    runLines = [
      'document.addEventListener("ed11yResults", () => {',
      '  const resultObj = Ed11yResults();',
      '  const resultJSON = JSON.stringify(resultObj);',
      '  const container = document.createElement("pre");',
      '  container.id = "resultContainer";',
      '  container.textContent = resultJSON;',
      '  document.body.insertAdjacentElement("beforeend", container);',
      '}'
    ];
    runScript.textContent = runLines.join('\n');
    document.body.insertAdjacentElement('beforeend', runScript);
    return document.getElementById('resultContainer').textContent;
  });
  // Initialize the act report.
  let data = {};
  let result = {};
  // Get the ASLint runner and bundle scripts.
  const aslintRunner = await fs.readFile(`${__dirname}/../procs/aslint.js`, 'utf8');
  const aslintBundle = await fs.readFile(
    `${__dirname}/../node_modules/aslint-testaro/aslint.bundle.js`, 'utf8'
  );
  // Get the nonce, if any.
  const {report} = options;
  const {jobData} = report;
  const scriptNonce = jobData && jobData.lastScriptNonce;
  // Inject the ASLint bundle and runner into the page.
  await page.evaluate(args => {
    const {scriptNonce, aslintBundle, aslintRunner} = args;
    // Bundle.
    const bundleEl = document.createElement('script');
    bundleEl.id = 'aslintBundle';
    if (scriptNonce) {
      bundleEl.nonce = scriptNonce;
      console.log(`Added nonce ${scriptNonce} to bundle`);
    }
    bundleEl.textContent = aslintBundle;
    document.head.insertAdjacentElement('beforeend', bundleEl);
    // Runner.
    const runnerEl = document.createElement('script');
    if (scriptNonce) {
      runnerEl.nonce = scriptNonce;
      console.log(`Added nonce ${scriptNonce} to runner`);
    }
    runnerEl.textContent = aslintRunner;
    document.body.insertAdjacentElement('beforeend', runnerEl);
  }, {scriptNonce, aslintBundle, aslintRunner})
  .catch(error => {
    const message = `ERROR: ASLint injection failed (${error.message.slice(0, 400)})`;
    console.log(message);
    data.prevented = true;
    data.error = message;
  });
  // If the injection succeeded:
  const reportLoc = page.locator('#aslintResult');
  if (! data.prevented) {
    // Wait for the test results.
    await reportLoc.waitFor({
      state: 'attached',
      timeout: 30000
    })
    .catch(error => {
      const message = `ERROR: Results timed out (${error.message.slice(0, 400)})`;
      console.log(message);
      data.prevented = true;
      data.error = message;
    });
  }
  // If the results arrived in time:
  if (! data.prevented) {
    // Get them.
    const actReport = await reportLoc.textContent();
    // Populate the act report.
    result = JSON.parse(actReport);
    // Delete irrelevant properties from the tool report details.
    if (result.rules) {
      Object.keys(result.rules).forEach(ruleID => {
        if (['passed', 'skipped'].includes(result.rules[ruleID].status.type)) {
          delete result.rules[ruleID];
        }
      });
    }
  }
  // Return the act report.
  try {
    JSON.stringify(data);
  }
  catch(error) {
    const message = `ERROR: ASLint result cannot be made JSON (${error.message.slice(0, 200)})`;
    data = {
      prevented: true,
      error: message
    };
  }
  return {
    data,
    result
  };
};
