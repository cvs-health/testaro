// test.js
// Test executor.

const fs = require('fs');
const {handleRequest} = require(`${__dirname}/../../run`);
const scriptJSON = fs.readFileSync(`${__dirname}/../../samples/scripts/simple.json`, 'utf8');
const script = JSON.parse(scriptJSON);
const report = {
  id: '',
  script,
  log: [],
  acts: []
};
handleRequest(report)
.then(
  () => {
    const {log, acts} = report;
    if (
      log.length === 2
      && log[1].event === 'endTime'
      && /^\d{4}-.+$/.test(log[0].value)
      && log[1].value >= log[0].value
    ) {
      console.log('Success: Log has been correctly populated');
    }
    else {
      console.log('Failure: Log empty or invalid');
      console.log(JSON.stringify(log, null, 2));
    }
    if (
      acts.length === 3
      && acts[0]
      && acts[0].type === 'launch'
      && acts[2].result
      && acts[2].result.visibleElements
      && typeof acts[2].result.visibleElements === 'number'
    ) {
      console.log('Success: Acts have been correctly populated');
    }
    else {
      console.log('Failure: Acts empty or invalid');
      console.log(JSON.stringify(acts, null, 2));
    }
  },
  rejection => {
    console.log(`Failure: ${rejection}`);
  }
);
