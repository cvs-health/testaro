// sample.js
// Sample executor for Testaro.

const options = {
  reports: '../reports',
  // To use the sample batch, uncomment the following line.
  // batches: '../batches/sample.json',
  script: '../scripts/app/sample.json'
};
const {handleRequest} = require('../../index');
handleRequest(options);
