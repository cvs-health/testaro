/*
  runScript.js
  Runs a script and writes a report file.
*/

// ########## IMPORTS

const {doJob} = require('./run');

// ########## FUNCTIONS

// Runs a script and returns the report.
const runScript = async (id, scriptJSON) => {
  const report = {
    id,
    log: [],
    script: JSON.parse(scriptJSON),
    acts: []
  };
  let reportJSON = JSON.stringify(report, null, 2);
  await doJob(report);
  report.acts.forEach(act => {
    try {
      JSON.stringify(act);
    }
    catch (error) {
      console.log(`ERROR: act of type ${act.type} malformatted`);
      act = {
        type: act.type || 'ERROR',
        which: act.which || 'N/A',
        prevented: true,
        error: error.message
      };
      console.log(`act changed to:\n${JSON.stringify(act, null, 2)}`);
    }
  });
  try {
    reportJSON = JSON.stringify(report, null, 2);
    return reportJSON;
  }
  catch(error) {
    console.log(`ERROR: report for host ${id} not JSON (${error.message})`);
    return '';
  }
};

// ########## OPERATION
runScript(... process.argv.slice(2));
