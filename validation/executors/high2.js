// high2.js
// Validator for high-level invocation of Testaro with a batch.

const fs = require('fs/promises');
process.env.SCRIPTDIR = 'samples/scripts';
process.env.BATCHDIR = 'samples/batches';
process.env.REPORTDIR = 'temp';
const {runJob} = require('../../create');
const validate = async (scriptID, batchID) => {
  const timeStamp = await runJob(scriptID, batchID);
  try {
    const tempFileNames = await fs.readdir(`${__dirname}/../../temp`);
    const reportFileNames = tempFileNames.filter(fileName => fileName.startsWith(timeStamp));
    for (const fileName of reportFileNames) {
      const reportJSON = await fs.readFile(`${__dirname}/../../temp/${fileName}`);
      const report = JSON.parse(reportJSON);
      const {log, acts} = report;
      if (log.length !== 2) {
        console.log(
          `Failure: log length is ${log.length} instead of 2 (see temp/${fileName})`
        );
      }
      else if (acts.length !== 3) {
        console.log(
          `Failure: acts length is ${acts.length} instead of 3 (see temp/${fileName})`
        );
      }
      else {
        console.log(`Success (report is in temp/${fileName})`);
      }
    }
  }
  catch(error) {
    console.log(`ERROR: ${error.message}`);
  }
};
validate('simple', 'weborgs');
