
/*
  call.js
  Invokes Testaro modules.
  This is the universal module for use of Testaro from a command line.
  Arguments:
    0. function to execute.
    1+. arguments to pass to the function.
  Usage examples:
    node call run ts99
    node call dirWatch true 30
*/

// IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to process files.
const fs = require('fs/promises');
// Function to process a testing request.
const {doJob} = require('./run');
// Function to watch for jobs.
const {dirWatch, netWatch} = require('./watch');

// CONSTANTS

const fn = process.argv[2];
const fnArgs = process.argv.slice(3);
const jobDir = process.env.JOBDIR;
const todoDir = `${jobDir}/todo`;
const reportDir = process.env.REPORTDIR;
const rawDir = `${reportDir}/raw`;

// FUNCTIONS

// Fulfills a testing request.
const callRun = async jobIDStart => {
  // Find the job.
  const jobDirFileNames = await fs.readdir(todoDir);
  const jobFileName = jobDirFileNames.find(fileName => fileName.startsWith(jobIDStart));
  // If it exists:
  if (jobFileName) {
    // Get it.
    const jobJSON = await fs.readFile(`${todoDir}/${jobFileName}`, 'utf8');
    const report = JSON.parse(jobJSON);
    // Run it.
    await doJob(report);
    // Archive it.
    await fs.rename(`${todoDir}/${jobFileName}`, `${jobDir}/done/${jobFileName}`);
    // Save the report.
    await fs.writeFile(`${rawDir}/${jobFileName}`, JSON.stringify(report, null, 2));
    console.log(`Job completed and report ${report.id}.json saved in ${rawDir}`);
  }
  // Otherwise, i.e. if the job does not exist.
  else {
    // Report the error.
    console.log(`ERROR: No to-do job ID starts with ${jobIDStart}`);
  }
};
// Starts a directory watch, converting the interval argument to a number.
const callDirWatch = async (isForever, interval) => {
  await dirWatch(isForever === 'true', Number.parseInt(interval, 10));
};
// Starts a network watch, converting the interval argument to a number.
const callNetWatch = async(isForever, interval) => {
  netWatch(isForever === 'true', Number.parseInt(interval, 10));
};

// OPERATION

// Execute the requested function.
if (fn === 'run' && fnArgs.length === 1) {
  callRun(fnArgs)
  .then(() => {
    console.log('Execution completed\n');
    process.exit(0);
  });
}
else if (fn === 'dirWatch' && fnArgs.length === 2) {
  callDirWatch(... fnArgs);
}
else if (fn === 'netWatch' && fnArgs.length === 2) {
  callNetWatch(... fnArgs);
}
else {
  console.log('ERROR: Invalid statement');
}
