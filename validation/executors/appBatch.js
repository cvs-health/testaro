// app.js
// Validator for Testaro application with a script and a batch.

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
        which: 'https://*',
        what: 'URL to be replaced with URLs in the batch'
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
  batch: {
    what: 'Two websites',
    hosts: [
      {
        which: 'https://www.w3.org/',
        what: 'W3C'
      },
      {
        which: 'https://www.wikimedia.org/',
        what: 'Wikimedia'
      }
    ]
  },
  log: [],
  reports: []
};
const {handleRequest} = require(`${__dirname}/../../index`);
const isValidReport = (reports, index) => {
  const isValid = reports[index].acts
  && reports[index].acts.length === 4
  && reports[index].acts[2].result
  && reports[index].acts[2].result.visibleElements
  && typeof reports[index].acts[2].result.visibleElements === 'number'
  && reports[index].acts[3].result
  && typeof reports[index].acts[3].result === 'string'
  && reports[index].acts[3].result.startsWith('ERROR');
  return isValid;
};
handleRequest(options)
.then(
  () => {
    const {log, reports} = options;
    if (
      log.length === 4
      && log[1].event === 'timeStamp'
      && /^[a-z0-9]+$/.test(log[1].value)
      && log[2].event === 'batchSize'
      && log[2].value === 2
    ) {
      console.log('Success: Log has been correctly populated');
    }
    else {
      console.log('Failure: Log empty or invalid');
      console.log(JSON.stringify(log, null, 2));
    }
    if (reports.length === 2 && isValidReport(reports, 0) && isValidReport(reports, 1)) {
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
