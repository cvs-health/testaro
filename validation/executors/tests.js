// tests.js
// Validator for Testaro tests.

const fs = require('fs').promises;
const {doJob} = require(`${__dirname}/../../run`);
const validateTests = async () => {
  const totals = {
    attempts: 0,
    successes: 0
  };
  const scriptFileNames = await fs.readdir(`${__dirname}/../tests/scripts`);
  for (const scriptFileName of scriptFileNames) {
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
      && testActs.every(act => act.result && act.result.failureCount !== undefined)
    ) {
      totals.attempts++;
      totals.successes++;
      console.log('Success: Reports have been correctly populated');
      if (acts.every(
        act => act.type === 'test' ? act.result.failureCount === 0 : true
      )) {
        totals.attempts++;
        totals.successes++;
        console.log('Success: No failures');
      }
      else {
        totals.attempts++;
        console.log('Failure: At least one test has at least one failure');
        console.log(JSON.stringify(acts, null, 2));
      }
    }
    else {
      totals.attempts++;
      console.log('Failure: Reports empty or invalid');
      console.log(JSON.stringify(acts, null, 2));
    }
  }
  console.log(`Grand totals: attempts ${totals.attempts}, successes ${totals.successes}`);
};
validateTests();
