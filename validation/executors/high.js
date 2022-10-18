// high.js
// Validator for high-level invocation of Testaro.

// ########## IMPORTS

const fs = require('fs/promises');

// ########## CONSTANTS

const projectRoot = `${__dirname}/../..`;
process.env.REPORTDIR = `${projectRoot}/temp`;
const reportDir = process.env.REPORTDIR;
process.env.SCRIPTDIR = `${projectRoot}/samples`;

// ########## OPERATION

// Run the simple script and write a report.
const {runJob} = require(`${projectRoot}/high`);
runJob('simple')
.then(
  // When the report has been written:
  async () => {
    // Open it.
    const fileNames = await fs.readdir(reportDir);
    const reportNames = fileNames.filter(name => name.endsWith('-simple.json'));
    if (reportNames.length) {
      try {
        // Check its log and act lengths against expectations.
        const reportJSON = await fs.readFile(`${reportDir}/${reportNames[0]}`);
        const report = JSON.parse(reportJSON);
        const {log, acts} = report;
        if (log.length !== 2) {
          console.log(
            `Failure: log length is ${log.length} instead of 2 (see temp/${reportNames[0]}})`
          );
        }
        else if (acts.length !== 3) {
          console.log(
            `Failure: acts length is ${acts.length} instead of 3 (see temp/${reportNames[0]}})`
          );
        }
        else {
          console.log(`Success (report is in temp/${reportNames[0]})`);
        }
      }
      catch(error) {
        console.log(`ERROR: ${error.message}`);
      }
    }
    else {
      console.log('ERROR: report not found');
    }
  },
  error => {
    console.log(`ERROR running script (${error.message})`);
  }
);
