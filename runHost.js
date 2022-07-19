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
  await handleRequest(report);
  const reportJSON = JSON.stringify(report, null, 2);
  process.send(reportJSON);
  process.disconnect();
  process.exit();
};

// ########## OPERATION
runHost(... process.argv.slice(2));
