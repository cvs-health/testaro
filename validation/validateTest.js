/*
  © 2022–2024 CVS Health and/or one of its affiliates. All rights reserved.

  MIT License

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
  validateTest.js
  Validator for one Testaro test.
*/

// IMPORTS

// Module to process files.
const fs = require('fs').promises;
// Module to run Testaro jebs.
const {doJob} = require('../run');

// FUNCTIONS

// Validates a test.
exports.validateTest = async testID => {
  // Get the job that validates the test.
  const jobFileNames = await fs.readdir(`${__dirname}/tests/jobs`);
  for (const jobFileName of jobFileNames.filter(fileName => fileName === `${testID}.json`)) {
    const jobJSON = await fs.readFile(`${__dirname}/tests/jobs/${jobFileName}`, 'utf8');
    const report = JSON.parse(jobJSON);
    // Perform it.
    await doJob(report);
    // Report whether the end time was reported.
    const {acts, jobData} = report;
    if (jobData.endTime && /^(?:\d{2}-){2}\d{2}T\d{2}:\d{2}$/.test(jobData.endTime)) {
      console.log('Success: End time has been correctly populated');
    }
    else {
      console.log('Failure: End time empty or invalid');
    }
    // If the test acts were correctly reported:
    const testActs = acts.filter(act => act.type && act.type === 'test');
    if (
      testActs.length === report.acts.filter(act => act.type === 'test').length
      && testActs.every(
        testAct => testAct.expectationFailures !== undefined
      )
    ) {
      // Report this.
      console.log('Success: Reports have been correctly populated');
      // If all expectations were satisfied:
      if (testActs.every(testAct => testAct.expectationFailures === 0)) {
        // Report this.
        console.log('######## Success: No failures\n');
      }
      // Otherwise, i.e. if not all expectations were satisfied:
      else {
        // Report this.
        console.log(
          '######## Failure: The test has at least one failure (see “"passed": false” below)\n'
        );
        // Output the acts that had failures.
        console.log(
          JSON.stringify(
            acts.filter(act => act.type === 'test' && act.expectationFailures), null, 2
          )
        );
      }
    }
    else {
      console.log('Failure: Reports empty or invalid');
      console.log(JSON.stringify(acts, null, 2));
    }
  }
  return Promise.resolve('');
};
