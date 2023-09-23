/*
  aslint
  This test implements the ASLint ruleset for accessibility.
*/

// IMPORTS

// Module to handle files.
const fs = require('fs/promises');

// FUNCTIONS

// Conducts and reports an ASLint test.
exports.reporter = async page => {
  // Inject the ASLint bundle script into the page.
  await page.addScriptTag(`${__dirname}/../node_modules/aslint-testaro/aslint.bundle.js`)
  .catch(error => {
    console.log(`ERROR: ASLint injection failed (${error.message.slice(0, 200)})`);
    data.prevented = true;
    data.error = 'ERROR: ASLint injection failed';
  });
  // If the injection succeeded:
  if (! data.prevented) {
    // Get the data on the elements violating the specified ASLint rules.
    const aslintReport = 'stuff'
    .catch(error => {
      console.log(`ERROR: ASLint failed (${error.message.slice(0, 200)}'`);
      return '';
    });
    // If the test succeeded:
    if (aslintReport.length) {
      // Initialize the result.
      data.totals = {
        stuff: 0
      };
      data.details = 'details';
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
