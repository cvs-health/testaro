/*
  create.js
  Creates and runs a file-based job and writes a report file.
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
const {doJob} = require('./run');

// ########## CONSTANTS

const scriptDir = process.env.SCRIPTDIR;
const reportDir = process.env.REPORTDIR;

// ########## VARIABLES

// Set 5 minutes as a default time limit.
let timeLimit = 300;

// ########## FUNCTIONS

// Runs one script with no batch and writes a report file.
const runScript = async (id, script) => {
  const report = {
    id,
    host: {},
    log: [],
    script,
    acts: []
  };
  await doJob(report);
  const reportJSON = JSON.stringify(report, null, 2);
  await fs.writeFile(`${reportDir}/${id}.json`, reportJSON);
};
// Runs a file-based job and writes a report file for the script or each host.
exports.runJob = async scriptID => {
  process.on('SIGINT', () => {
    console.log('ERROR: Terminal interrupted runJob');
  });
  if (scriptID) {
    try {
      const scriptJSON = await fs.readFile(`${scriptDir}/${scriptID}.json`, 'utf8');
      const script = JSON.parse(scriptJSON);
      // Get the time limit of the script or, if none, set it to 5 minutes.
      timeLimit = script.timeLimit || timeLimit;
      // Identify the start time and a timestamp.
      const timeStamp = Math.floor((Date.now() - Date.UTC(2022, 1)) / 2000).toString(36);
      // Run the script and save the result with a timestamp ID.
      await runScript(timeStamp, script);
      console.log(`Report ${timeStamp}.json in ${process.env.REPORTDIR}`);
    }
    catch(error) {
      console.log(`ERROR running job (${error.message})\n${error.stack}`);
    }
  }
  else {
    console.log('ERROR: no script specified');
  }
};
