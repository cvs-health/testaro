// low.js
// Validator for low-level invocation of Testaro.

const report = {
  script: {
    id: 'script0',
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
        what: 'simple page'
      },
      {
        type: 'test',
        which: 'bulk',
        what: 'bulk'
      }
    ]
  },
  log: [],
  acts: []
};
const {handleRequest} = require('../../run');
handleRequest(report)
.then(
  () => {
    const {log, acts} = report;
    if (log.length === 2 && acts.length === 4) {
      console.log('Success');
    }
    else {
      console.log('Failure');
    }
  },
  rejection => {
    console.log(`Failure: ${rejection}`);
  }
);
