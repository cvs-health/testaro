// high.js
// Validator for high-level invocation of Testaro.

// ########## IMPORTS

const fs = require('fs/promises');

// ########## CONSTANTS

const projectRoot = `${__dirname}/../..`;
process.env.JOBDIR = `${projectRoot}/validation/jobs`;
process.env.REPORTDIR = `${projectRoot}/temp`;
const reportDir = process.env.REPORTDIR;
const jobID = '00000-simple-example';

// ########## OPERATION

// Run the simple job and write a report.
const {runJob} = require(`${projectRoot}/high`);
runJob(jobID)
.then(
  // When the report has been written:
  async () => {
    try {
      // Check it against expectations.
      const reportJSON = await fs.readFile(`${reportDir}/${jobID}.json`, 'utf8');
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
  },
  error => {
    console.log(`ERROR running job (${error.message})`);
  }
);
