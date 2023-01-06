// watchDir.js
// Validator for directory watching.

// IMPORTS

const fs = require('fs/promises');

// CONSTANTS

// Override cycle environment variables with validation-specific ones.
process.env.PROTOCOL = 'http';
process.env.JOBDIR = `${__dirname}/../watch`;
process.env.REPORTDIR = `${__dirname}/../../temp`;
const jobID = '00000-simple-example';
const {cycle} = require('../../watch');

// Start checking for jobs every 5 seconds.
cycle(true, false, 5)
.then(() => {
  console.log('Success: Watch validation ended');
});
// Make a job available after 7 seconds.
setTimeout(() => {
  fs.copyFile(
    `${__dirname}/../jobs/todo/${jobID}.json`, `${process.env.JOBDIR}/todo/${jobID}.json`
  );
  console.log('Job made available after 7 seconds');
}, 7000);
