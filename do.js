/*
  do.js
  Invokes Testaro modules with arguments.
  This is the universal module for use of Testaro from a command line.
  Arguments:
    0. function to execute.
    1+. arguments to pass to the function.
  Usage examples:
    node do high script454
    node do watch dir once 30
    node do watch net forever 60
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
const fnArgs = process.argv.slice(2);
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Fulfills a high-level testing request.
const doHigh = async scriptID => {
  await runJob(scriptID);
  console.log(`Job completed and report ${scriptID}.json saved in ${reportDir}`);
};
// Starts a watch.
const doWatch = async (isDirWatch, isForever, interval) => {
  console.log(
    `Starting a ${isForever ? 'repeating' : 'one-time'} ${isDirWatch ? 'directory' : 'network'} watch`
  );
  await cycle(isDirWatch, isForever, interval);
  console.log('Watching ended');
};

// ########## OPERATION

// Execute the requested function.
if (fn === 'high' && fnArgs.length === 1) {
  doHigh(fnArgs)
  .then(() => {
    console.log('Execution completed');
  });
}
else if (fn === 'watch' && fnArgs.length === 3) {
  doWatch(... fnArgs)
  .then(() => {
    console.log('Execution completed');
  });
}
else {
  console.log('ERROR: Invalid statement');
}
