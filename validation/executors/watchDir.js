// watchDir.js
// Validator for directory watching.

const fs = require('fs/promises');
process.env.WATCH_TYPE = 'dir';
process.env.INTERVAL = 5;
process.env.REPORTDIR = 'temp';
process.env.JOBDIR = 'validation/jobs';
process.env.EXJOBDIR = 'validation/exJobs';
process.env.WATCH_FOREVER = false;
// Start checking for jobs every 5 seconds.
require('../../watch');
// Copy a job into JOBDIR after 7 seconds.
setTimeout(() => {
  fs.copyFile(`${__dirname}/../protoJobs/simple1.json`, `${__dirname}/../jobs/val1.json`);
  console.log('Job copied into job directory after 7 seconds');
}, 7000);
