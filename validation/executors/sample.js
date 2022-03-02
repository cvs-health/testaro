// sample.js
// Sample executor for Testaro.

const options = {
  reports: `${__dirname}/../reports`,
  // To use the sample batch, uncomment the following line.
  batches: `${__dirname}/../batches/sample.json`,
  script: `${__dirname}/../scripts/app/sample.json`
};
const {handleRequest} = require('../../index');
handleRequest(options);
