/*
  runHost.js
  Runs a host job and writes a report file.
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
const {handleRequest} = require('./run');

// ########## CONSTANTS
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Runs one script and writes a report file.
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
  await fs.writeFile(`${reportDir}/${id}.json`, reportJSON);
  process.disconnect();
  process.exit();
};

// ########## OPERATION
runHost(... process.argv.slice(2));
