// run.js
// Validator for immediate job execution.

// ########## IMPORTS

const fs = require('fs/promises');

// ########## CONSTANTS

const projectRoot = `${__dirname}/../..`;
const {doJob} = require(`${projectRoot}/run`);
process.env.JOBDIR = `${projectRoot}/validation/jobs`;
process.env.REPORTDIR = `${projectRoot}/temp`;
const jobID = '00000-simple-example';

// ########## OPERATION

// Get the simple job.
fs.readFile(`${process.env.JOBDIR}/toto/${jobID}.json`)
.then(async jobJSON => {
  const report = JSON.parse(jobJSON);
  // Run it.
  await doJob(report);
  try {
    // Check the report against expectations.
    const {acts, jobData} = report;
    if (acts.length !== 3) {
      console.log('Failure: Counts of acts is not 3');
    }
    else if (! jobData) {
      console.log('Failure: Report omits jobData');
    }
    else if (jobData.endTime < jobData.startTime) {
      console.log('Failure: End time precedes start time');
    }
    else {
      console.log('Success');
    }
  }
  catch(error) {
    console.log(`ERROR: ${error.message}`);
  }
});
