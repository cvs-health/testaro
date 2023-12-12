/*
  © 2022–2023 CVS Health and/or one of its affiliates. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  call
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
const {dirWatch} = require('./dirWatch');
const {netWatch} = require('./netWatch');

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
  const jobFileName = jobIDStart
  ? jobDirFileNames.find(fileName => fileName.startsWith(jobIDStart))
  : jobDirFileNames[0];
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
const callDirWatch = async (isForever, intervalInSeconds) => {
  await dirWatch(isForever === 'true', Math.max(5, Number.parseInt(intervalInSeconds, 10)));
};
// Starts a network watch, converting the interval argument to a number.
const callNetWatch = async (isForever, intervalInSeconds, isCertTolerant) => {
  await netWatch(
    isForever === 'true',
    Number.parseInt(intervalInSeconds, 10),
    isCertTolerant ? isCertTolerant === 'true' : undefined
  );
  console.log('netWatch run');
};

// OPERATION

// Execute the requested function.
if (fn === 'run' && fnArgs.length < 2) {
  callRun(fnArgs[0])
  .then(() => {
    console.log('Execution completed\n');
    process.exit(0);
  });
}
else if (fn === 'dirWatch' && fnArgs.length === 2) {
  callDirWatch(... fnArgs)
  .then(() => {
    console.log('Directory watch ended');
    process.exit(0);
  });
}
else if (fn === 'netWatch' && [2, 3].includes(fnArgs.length)) {
  callNetWatch(... fnArgs)
  .then(() => {
    console.log('Network watch ended');
    process.exit(0);
  });
}
else {
  console.log('ERROR: Invalid statement');
  process.exit(1);
}
