/*
  runHost.js
  Runs a host job and writes a report file.
*/

// ########## IMPORTS

const {handleRequest} = require('./run');

// ########## FUNCTIONS

// Runs one script and sends the report to the parent.
const runHost = async (id, scriptJSON, hostJSON) => {
  const report = {
    id,
    host: JSON.parse(hostJSON),
    log: [],
    script: JSON.parse(scriptJSON),
    acts: []
  };
  let reportJSON = JSON.stringify(report, null, 2);
  await handleRequest(report);
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
  }
  catch(error) {
    console.log(`ERROR: report for host ${id} not JSON (${error.message})`);
  }
  process.send(reportJSON, () => {
    process.disconnect();
    process.exit();
  });
};

// ########## OPERATION
runHost(... process.argv.slice(2));
