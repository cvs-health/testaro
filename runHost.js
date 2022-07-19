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
  console.log(`Running runHost on ${id}`);
  const report = {
    id,
    host: JSON.parse(hostJSON),
    log: [],
    script: JSON.parse(scriptJSON),
    acts: []
  };
  console.log(`Report before handleRequest:\n${JSON.stringify(report, null, 2)}`);
  await handleRequest(report);
  const reportJSON = JSON.stringify(report, null, 2);
  console.log(`Report after handleRequest:\n${reportJSON}`);
  await fs.writeFile(`${reportDir}/${id}.json`, reportJSON);
  console.log('File written');
  const tempFile = await fs.readFile(`${reportDir}/${id}.json`, 'utf8');
  console.log(`File content:\n${tempFile}`);
  process.disconnect();
  process.exit();
};

// ########## OPERATION
runHost(... process.argv.slice(2));
