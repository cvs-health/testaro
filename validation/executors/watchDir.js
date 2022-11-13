// watchDir.js
// Validator for directory watching.

// IMPORTS

const fs = require('fs/promises');

// CONSTANTS

// Override cycle environment variables with validation-specific ones.
process.env.PROTOCOL = 'http';
process.env.JOBDIR = `${__dirname}/../watch`;
process.env.DONEDIR = `${__dirname}/../done`;
process.env.REPORTDIR = `${__dirname}/../../temp`;
const jobID = '00000-simple-example';
const {cycle} = require(`${__dirname}/../../watch`);

// Start checking for jobs every 5 seconds.
cycle(true, false, 5)
.then(() => {
  console.log('Watch validation ended');
});
// Copy a job into JOBDIR after 7 seconds.
setTimeout(() => {
  fs.copyFile(`${__dirname}/../jobs/${jobID}.json`, `${process.env.JOBDIR}/${jobID}.json`);
  console.log('Job copied into watched-job directory after 7 seconds');
}, 7000);
