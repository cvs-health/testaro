/*
  © 2023–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  dirWatch.js
  Module for watching a directory for jobs.
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Module to perform jobs.
const {doJob} = require('./run');

// ########## CONSTANTS

const jobDir = process.env.JOBDIR;
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Gets a segment of a timestamp.
const tsPart = (timeStamp, startIndex) => timeStamp.slice(startIndex, startIndex + 2);
// Returns a string representing the date and time.
const nowString = () => (new Date()).toISOString().slice(2, 16);
// Gets date of a timestamp.
const dateOf = ts => {
  const dateString = `20${tsPart(ts, 0)}-${tsPart(ts, 2)}-${tsPart(ts, 4)}`;
  const timeString = `${tsPart(ts, 7)}:${tsPart(ts, 9)}:00`;
  const dateTimeString = `${dateString}T${timeString}Z`;
  return new Date(dateTimeString);
};
// Writes a directory report.
const writeDirReport = async report => {
  const jobID = report && report.id;
  if (jobID) {
    try {
      const reportJSON = JSON.stringify(report, null, 2);
      const reportName = `${jobID}.json`;
      await fs.mkdir(`${reportDir}/raw`, {recursive: true});
      await fs.writeFile(`${reportDir}/raw/${reportName}`, `${reportJSON}\n`);
      console.log(`Report ${jobID} saved in ${reportDir}/raw`);
    }
    catch(error) {
      console.log(`ERROR: Failed to save report ${jobID} in ${reportDir}/raw (${error.message})`);
    }
  }
  else {
    console.log('ERROR: Job has no ID');
  }
};
// Archives a job.
const archiveJob = async (job, isFile) => {
  // Save the job in the done subdirectory.
  const {id} = job;
  const jobJSON = JSON.stringify(job, null, 2);
  await fs.mkdir(`${jobDir}/done`, {recursive: true});
  await fs.writeFile(`${jobDir}/done/${id}.json`, `${jobJSON}\n`);
  // If the job had been saved as a file in the todo subdirectory:
  if (isFile) {
    // Delete the file.
    await fs.rm(`${jobDir}/todo/${id}.json`);
  }
  console.log(`Job ${id} archived in ${jobDir}/done (${nowString()})`);
};
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
/* 
  Checks for a directory job and, when found, performs and reports it.
  Arguments:
  0. Whether to continue watching after a job is run.
  1: interval in seconds from a no-job check to the next check.
*/
exports.dirWatch = async (isForever, intervalInSeconds) => {
  console.log(`Starting to watch directory ${jobDir}/todo for jobs`);
  let notYetRun = true;
  // As long as watching as to continue:
  while (isForever || notYetRun) {
    try {
      // If there are any jobs in the watched directory:
      const toDoFileNames = await fs.readdir(`${jobDir}/todo`);
      const jobFileNames = toDoFileNames.filter(fileName => fileName.endsWith('.json'));
      if (jobFileNames.length) {
        // If the first one is ready to do:
        const firstJobTimeStamp = jobFileNames[0].replace(/-.+$/, '');
        if (Date.now() > dateOf(firstJobTimeStamp)) {
          // Get it.
          const jobJSON = await fs.readFile(`${jobDir}/todo/${jobFileNames[0]}`, 'utf8');
          try {
            const job = JSON.parse(jobJSON);
            const report = JSON.parse(jobJSON);
            // Ensure it has no server properties.
            job.observe = false;
            job.sendReportTo = '';
            report.observe = false;
            report.sendReportTo = '';
            const {id} = job;
            console.log(`Directory job ${id} ready to do (${nowString()})`);
            // Perform it.
            await doJob(report);
            console.log(`Job ${id} finished (${nowString()})`);
            // Report it.
            await writeDirReport(report);
            // Archive it.
            await archiveJob(job, true);
          }
          catch(error) {
            console.log(`ERROR processing directory job (${error.message})`);
          }
          notYetRun = false;
        }
        // Otherwise, i.e. if the first one is not yet ready to do:
        else {
          // Report this.
          console.log(`All jobs in ${jobDir} not yet ready to do (${nowString()})`);
          // Wait for the specified interval.
          await wait(1000 * intervalInSeconds);
        }
      }
      // Otherwise, i.e. if there are no jobs in the watched directory:
      else {
        console.log(`No job in ${jobDir} (${nowString()})`);
        // Wait for the specified interval.
        await wait(1000 * intervalInSeconds);
      }
    }
    // If a fatal error was thrown:
    catch(error) {
      // Report this.
      console.log(`ERROR: Directory watching failed (${error.message}); watching aborted`);
      // Quit watching.
      break;
    }
  }
};
