/*
  high.js
  Invokes Testaro with the high-level method.
  Usage example: node high tp25
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Module to run scripts and report results.
const {doJob} = require('./run');

// ########## CONSTANTS

const jobDir = process.env.JOBDIR;
const reportDir = process.env.REPORTDIR;

// ########## VARIABLES

// Set 5 minutes as a default time limit.
let timeLimit = 300;

// ########## FUNCTIONS

// Performs a file-based job and writes a report file.
exports.runJob = async jobID => {
  try {
    // Get the job.
    const jobJSON = await fs.readFile(`${jobDir}/${jobID}.json`, 'utf8');
    const job = JSON.parse(jobJSON);
    // If the job has no time limit, give it the default one.
    if (! job.timeLimit) {
      job.timeLimit = timeLimit;
    }
    // Initialize a report for the job.
    const report = {
      job,
      acts: [],
      jobData: {}
    };
    // Run the job, adding the results to the report.
    await doJob(report);
    const reportJSON = JSON.stringify(report, null, 2);
    await fs.writeFile(`${reportDir}/${jobID}.json`, reportJSON);
    console.log(`Report ${jobID}.json recorded in ${process.env.REPORTDIR}`);
  }
  catch(error) {
    console.log(`ERROR running job (${error.message})\n${error.stack}`);
  }
};
