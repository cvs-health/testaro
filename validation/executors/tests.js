// tests.js
// Validator for Testaro tests.

// IMPORTS

const fs = require('fs').promises;
const {validateTest} = require('../validateTest');

// OPERATION

// Get the names of the Testaro validation test files.
fs.readdir(`${__dirname}/../tests/jobs`)
// When they arrive:
.then(async fileNames => {
  // For each file name:
  for (const fileName of fileNames) {
    // Get the test ID from it by disregarding its .json extension.
    const testID = fileName.slice(0, -5);
    // Validate the test.
    validateTest(testID);
  }
});
