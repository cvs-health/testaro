/*
  call.js
  Invokes Testaro modules with arguments.
  This is the universal module for use of Testaro from a command line.
  Arguments:
    0. function to execute.
    1+. arguments to pass to the function.
  Usage examples:
    node call high script454
    node call watch dir once 30
    node call watch net forever 60
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Function to process a high-level testing request.
const {runJob} = require('./high');
// Function to watch for jobs.
const {cycle} = require('./watch');

// ########## CONSTANTS

const fn = process.argv[2];
const fnArgs = process.argv.slice(3);
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Fulfills a high-level testing request.
const callHigh = async jobID => {
  await runJob(jobID);
  console.log(`Job completed and report ${jobID}.json saved in ${reportDir}`);
};
// Starts a watch.
const callWatch = async (isDirWatch, isForever, interval) => {
  console.log(
    `Starting a ${isForever === 'true' ? 'repeating' : 'one-time'} ${isDirWatch === 'true' ? 'directory' : 'network'} watch`
  );
  await cycle(isDirWatch === 'true', isForever === 'true', Number.parseInt(interval, 10));
};

// ########## OPERATION

// Execute the requested function.
if (fn === 'high' && fnArgs.length === 1) {
  callHigh(fnArgs)
  .then(() => {
    console.log('Execution completed');
  });
}
else if (fn === 'watch' && fnArgs.length === 3) {
  callWatch(... fnArgs)
  .then(() => {
    console.log('Execution completed');
  });
}
else {
  console.log('ERROR: Invalid statement');
}
