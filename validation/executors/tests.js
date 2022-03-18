// app.js
// Validator for Testaro tests.

const fs = require('fs').promises;
const {handleRequest} = require(`${__dirname}/../../index`);
const validateTests = async () => {
  const scriptFileNames = await fs.readdir(`${__dirname}/../tests/scripts`);
  for (const scriptFileName of scriptFileNames) {
    const rawScriptJSON = await fs
    .readFile(`${__dirname}/../tests/scripts/${scriptFileName}`, 'utf8');
    const scriptJSON = rawScriptJSON
    .replace(/__targets__/g, `file://${__dirname}/../tests/targets`);
    const script = JSON.parse(scriptJSON);
    const options = {script};
    options.log = [];
    options.reports = [];
    await handleRequest(options);
    const {log, reports} = options;
    if (log.length === 3 && log[1].event === 'timeStamp' && /^[a-z0-9]+$/.test(log[1].value)) {
      console.log('Success: Log has been correctly populated');
    }
    else {
      console.log('Failure: Log empty or invalid');
      console.log(JSON.stringify(log, null, 2));
    }
    if (
      reports.length === 1
      && reports[0].acts
      && reports[0].acts.length === script.commands.length
      && reports[0].acts.every(
        act => act.type && act.type === 'test'
          ? act.result && act.result.failureCount !== undefined 
          : true
      )
    ) {
      console.log('Success: Reports have been correctly populated');
      if (reports[0].acts.every(
        act => act.type === 'test' ? act.result.failureCount === 0 : true
      )) {
        console.log('Success: No failures');
      }
      else {
        console.log('Failure: At least one test has at least one failure');
        console.log(JSON.stringify(reports, null, 2));
      }
    }
    else {
      console.log('Failure: Reports empty or invalid');
      console.log(JSON.stringify(reports, null, 2));
    }
  }
};
validateTests();
