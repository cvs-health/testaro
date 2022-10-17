// test.js
// Validator for one Testaro test.
// Execution example: node validation/executors/test focOp

const fs = require('fs').promises;
const {doJob} = require(`${__dirname}/../../run`);
const test = process.argv[2];
const validateTests = async () => {
  const scriptFileNames = await fs.readdir(`${__dirname}/../tests/scripts`);
  for (const scriptFileName of scriptFileNames.filter(fileName => fileName === `${test}.json`)) {
    const rawScriptJSON = await fs
    .readFile(`${__dirname}/../tests/scripts/${scriptFileName}`, 'utf8');
    const scriptJSON = rawScriptJSON
    .replace(/__targets__/g, `file://${__dirname}/../tests/targets`);
    const script = JSON.parse(scriptJSON);
    const report = {script};
    report.log = [];
    report.acts = [];
    await doJob(report);
    const {log, acts} = report;
    if (log.length === 2 && log[1].event === 'endTime' && /^\d{4}-.+$/.test(log[1].value)) {
      console.log('Success: Log has been correctly populated');
    }
    else {
      console.log('Failure: Log empty or invalid');
      console.log(JSON.stringify(log, null, 2));
    }
    const testActs = acts.filter(act => act.type && act.type === 'test');
    if (
      testActs.length === script.commands.filter(cmd => cmd.type === 'test').length
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
validateTests()
.then(() => '');
