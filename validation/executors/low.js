// low.js
// Validator for low-level invocation of Testaro.

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
fs.readFile(`${process.env.JOBDIR}/${jobID}.json`)
.then(async jobJSON => {
  const job = JSON.parse(jobJSON);
  const report = {
    job,
    acts: [],
    jobData: {}
  };
  // Run it.
  await doJob(report);
  try {
    // Check the report against expectations.
    const reportJSON = await fs.readFile(`${process.env.REPORTDIR}/${jobID}.json`, 'utf8');
    const report = JSON.parse(reportJSON);
    const {job, acts, jobData} = report;
    if (! job) {
      console.log('Failure: Report omits job');
    }
    else if (acts.length !== 3) {
      console.log('Failure: Counts of acts is not 3');
    }
    else if (! jobData) {
      console.log('Failure: Report omits jobData');
    }
    else if (jobData.endTime < jobData.startTime) {
      console.log('Failure: End time precedes start time');
    }
    else {
      console.log(`Success (report is in temp/${jobID}.json)`);
    }
  }
  catch(error) {
    console.log(`ERROR: ${error.message}`);
  }
});
