// app.js
// Validator for Testaro application with a no-batch script.

const report = {
  script: {
    what: 'Sample Testaro executor with 1 test',
    strict: true,
    commands: [
      {
        type: 'launch',
        which: 'chromium',
        what: 'Chromium browser'
      },
      {
        type: 'url',
        which: 'https://example.com/',
        what: 'simple page, replaced if there is a batch'
      },
      {
        type: 'test',
        which: 'bulk',
        what: 'bulk'
      },
      {
        type: 'test',
        which: 'noSuchTest',
        what: 'test that does not exist'
      }
    ]
  },
  log: [],
  acts: []
};
const {handleRequest} = require(`${__dirname}/../../run`);
handleRequest(report)
.then(
  () => {
    const {log, acts} = report;
    if (log.length === 2 && log[1].event === 'endTime' && /^\d{4}-.+$/.test(log[1].value)) {
      console.log('Success: Log has been correctly populated');
    }
    else {
      console.log('Failure: Log empty or invalid');
      console.log(JSON.stringify(log, null, 2));
    }
    if (
      acts.length === 4
      && acts[2].result
      && acts[2].result.visibleElements
      && typeof acts[2].result.visibleElements === 'number'
      && acts[3].result
      && typeof acts[3].result === 'string'
      && acts[3].result.startsWith('ERROR')
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
