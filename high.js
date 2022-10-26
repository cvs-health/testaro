/*
  high.js
  Invokes Testaro with the high-level method.
  Usage example: node high script454
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Module to run scripts and report results.
const {doJob} = require('./run');

// ########## CONSTANTS

const scriptDir = process.env.SCRIPTDIR;
const reportDir = process.env.REPORTDIR;
const scriptID = process.argv[2];

// ########## VARIABLES

// Set 5 minutes as a default time limit.
let timeLimit = 300;

// ########## FUNCTIONS

// Performs a file-based job and writes a report file.
const runJob = async scriptID => {
  try {
    const scriptJSON = await fs.readFile(`${scriptDir}/${scriptID}.json`, 'utf8');
    const script = JSON.parse(scriptJSON);
    // Change the time limit to the script-specified one, if any.
    if (! script.timeLimit) {
      script.timeLimit = timeLimit;
    }
    // Run the script and record the report.
    const report = {
      id: scriptID,
      log: [],
      script,
      acts: []
    };
    await doJob(report);
    const reportJSON = JSON.stringify(report, null, 2);
    await fs.writeFile(`${reportDir}/${scriptID}.json`, reportJSON);
    console.log(`Report ${scriptID}.json recorded in ${process.env.REPORTDIR}`);
  }
  catch(error) {
    console.log(`ERROR running job (${error.message})\n${error.stack}`);
  }
};

// ########## OPERATION

// If this module was called with a scriptID argument:
if (scriptID) {
  // Run the script and write a report.
  runJob(scriptID);
}
// Otherwise, i.e. if it was required by another module:
else {
  // Export runJob so the other module can call it.
  exports.runJob = runJob;
}
