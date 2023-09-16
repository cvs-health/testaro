// validateTest.js
// Validator for one Testaro test.

// IMPORTS

// Module to process files.
const fs = require('fs').promises;
// Module to run Testaro jebs.
const {doJob} = require('../run');

// FUNCTIONS

// Validates a test.
exports.validateTest = async testID => {
  const jobFileNames = await fs.readdir(`${__dirname}/tests/jobs`);
  for (const jobFileName of jobFileNames.filter(fileName => fileName === `${testID}.json`)) {
    const jobJSON = await fs.readFile(`${__dirname}/tests/jobs/${jobFileName}`, 'utf8');
    const report = JSON.parse(jobJSON);
    await doJob(report);
    const {acts, jobData} = report;
    if (jobData.endTime && /^\d{4}-.+$/.test(jobData.endTime)) {
      console.log('Success: End time has been correctly populated');
    }
    else {
      console.log('Failure: End time empty or invalid');
    }
    const testActs = acts.filter(act => act.type && act.type === 'test');
    if (
      testActs.length === report.acts.filter(act => act.type === 'test').length
      && testActs.every(testAct => testAct.result && testAct.expectationFailures !== undefined)
    ) {
      console.log('Success: Reports have been correctly populated');
      if (testActs.every(testAct => testAct.expectationFailures === 0)) {
        console.log('######## Success: No failures\n');
      }
      else {
        console.log('Failure: The test has at least one failure');
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
