// high1.js
// Validator for high-level invocation of Testaro without a batch.

const fs = require('fs/promises');
process.env.SCRIPTDIR = 'samples/scripts';
process.env.REPORTDIR = 'temp';
const {runJob} = require('../../create');
const validate = async (scriptID) => {
  const timeStamp = await runJob(scriptID);
  try {
    const reportJSON = await fs.readFile(`${__dirname}/../../temp/${timeStamp}.json`);
    const report = JSON.parse(reportJSON);
    const {log, acts} = report;
    if (log.length !== 2) {
      console.log(
        `Failure: log length is ${log.length} instead of 2 (see temp/${timeStamp}.json})`
      );
      console.log(JSON.stringify(log, null, 2));
    }
    else if (acts.length !== 3) {
      console.log(
        `Failure: acts length is ${acts.length} instead of 3 (see temp/${timeStamp}.json})`
      );
    }
    else {
      console.log(`Success (report is in temp/${timeStamp}.json)`);
    }
  }
  catch(error) {
    console.log(`ERROR: ${error.message}`);
  }
};
validate('simple');
