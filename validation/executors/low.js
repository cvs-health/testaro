// low.js
// Validator for low-level invocation of Testaro.

const fs = require('fs/promises');
const getSampleScript = async scriptID => {
  const scriptJSON = await fs.readFile(`${__dirname}/../../samples/scripts/${scriptID}.json`);
  return JSON.parse(scriptJSON);
};
const validate = async () => {
  const script = await getSampleScript('simple');
  const report = {
    script,
    log: [],
    acts: []
  };
  const {handleRequest} = require('../../run');
  await handleRequest(report);
  const {log, acts} = report;
  if (log.length !== 2) {
    console.log(`Failure: log length is ${log.length} instead of 2`);
    console.log(JSON.stringify(log, null, 2));
  }
  else if (acts.length !== 3) {
    console.log(`Failure: acts length is ${acts.length} instead of 3`);
    console.log(JSON.stringify(acts, null, 2));
  }
  else {
    console.log('Success');
  }
};
validate();
