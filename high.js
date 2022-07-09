/*
  high.js
  Invokes Testaro with the high-level method.
  Usage example: node high tp12 weborgs
*/

const {runJob} = require('./create');
const scriptID = process.argv[2];
const batchID = process.argv[3];
runJob(scriptID, batchID);
