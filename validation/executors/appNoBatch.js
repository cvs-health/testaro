// app.js
// Validator for Testaro application with a no-batch script.

const options = {
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
  reports: []
};
const {handleRequest} = require(`${__dirname}/../../index`);
handleRequest(options)
.then(
  () => {
    const {log, reports} = options;
    if (log.length === 3 && log[1].event === 'timeStamp' && /^[a-z0-9]+$/.test(log[1].value)) {
      console.log('Success: Log has been correctly populated');
    }
    else {
      console.log('Failure: Log empty or invalid');
      console.log(JSON.stringify(log, null, 2));
    }
    if (
      reports.length === 1
      && reports[0].acts
      && reports[0].acts.length === 4
      && reports[0].acts[2].result
      && reports[0].acts[2].result.visibleElements
      && typeof reports[0].acts[2].result.visibleElements === 'number'
      && reports[0].acts[3].result
      && typeof reports[0].acts[3].result === 'string'
      && reports[0].acts[3].result.startsWith('ERROR')
    ) {
      console.log('Success: Reports have been correctly populated');
    }
    else {
      console.log('Failure: Reports empty or invalid');
      console.log(JSON.stringify(reports, null, 2));
    }
  },
  rejection => {
    console.log(`Failure: ${rejection}`);
  }
);
