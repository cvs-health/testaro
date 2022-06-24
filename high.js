/*
  high.js
  Invokes Testaro with the high-level method.
  Usage example: node high tp11 weborgs
*/

const {runJob} = require('./create');
const scriptID = process.argv[2];
const batchID = process.argv[3];
const run = async (scriptID, batchID) => {
  const timeStamp = await runJob(scriptID, batchID);
  console.log(`Reports in ${process.env.REPORTDIR}; ID base ${timeStamp}`);
};
run(scriptID, batchID);
