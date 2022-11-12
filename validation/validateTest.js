// validateTest.js
// Validator for one Testaro test.

const fs = require('fs').promises;
const {doJob} = require(`${__dirname}/../run`);
exports.validateTest = async testID => {
  const jobFileNames = await fs.readdir(`${__dirname}/tests/jobs`);
  for (const jobFileName of jobFileNames.filter(fileName => fileName === `${testID}.json`)) {
    const rawJobJSON = await fs
    .readFile(`${__dirname}/tests/jobs/${jobFileName}`, 'utf8');
    const jobJSON = rawJobJSON
    .replace(/__targets__/g, `file://${__dirname}/../tests/targets`);
    const job = JSON.parse(jobJSON);
    const report = {
      job,
      acts: [],
      jobData: {}
    };
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
      testActs.length === job.commands.filter(cmd => cmd.type === 'test').length
      && testActs.every(testAct => testAct.result && testAct.result.failureCount !== undefined)
    ) {
      console.log('Success: Reports have been correctly populated');
      if (testActs.every(testAct => testAct.result.failureCount === 0)) {
        console.log('Success: No failures');
      }
      else {
        console.log('Failure: The test has at least one failure');
        console.log(
          JSON.stringify(
            acts.filter(act => act.type === 'test' && act.result.failureCount), null, 2
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
