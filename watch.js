/*
  watch.js
  Module for watching for a job and running it when found.
*/

// ########## IMPORTS

// Module to keep secrets local.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Module to perform tests.
const {doJob} = require('./run');
// HTTP and HTTPS clients.
const http = require('http');
const https = require('https');

// ########## CONSTANTS

const httpClient = require('http');
const httpsClient = require('https');
const jobURLs = process.env.JOB_URLs;
const agent = process.env.AGENT;
const jobDir = process.env.JOBDIR;
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Returns a string representing the date and time.
const nowString = () => (new Date()).toISOString().slice(0, 19);
// Checks for a directory job.
const checkDirJob = async watchee => {
  try {
    const watchJobDir = watchee || jobDir;
    const toDoDirFileNames = await fs.readdir(`${watchJobDir}/todo`);
    const jobFileNames = toDoDirFileNames.filter(fileName => fileName.endsWith('.json'));
    if (jobFileNames.length) {
      const jobJSON = await fs.readFile(`${watchJobDir}/todo/${jobFileNames[0]}`, 'utf8');
      try {
        const job = JSON.parse(jobJSON, null, 2);
        return job;
      }
      catch(error) {
        return {
          error: `ERROR parsing job as JSON (${error.message})`,
          message: error.message
        };
      }
    }
    else {
      console.log(`No job to do (${nowString()})`);
      return {};
    }
  }
  catch(error) {
    console.log('ERROR: Directory watching failed');
    return {};
  }
};
// Checks for and, if obtained, returns a network job.
const checkNetJob = async watchee => {
  let watchJobURLs = [watchee];
  if (! watchJobURLs[0]) {
    watchJobURLs = jobURLs
    .split('+')
    .map(url => [Math.random(), url])
    .sort((a, b) => a[0] - b[0])
    .map(pair => pair[1]);
  }
  // For each watchee:
  for (const watchJobURL of watchJobURLs) {
    console.log(`About to check ${watchJobURL}`);
    const job = await new Promise(resolve => {
      // Request a job from it.
      const wholeURL = `${watchJobURL}?agent=${agent}`;
      const client = wholeURL.startsWith('https://') ? httpsClient : httpClient;
      const request = client.request(wholeURL, {timeout: 1000}, response => {
        const chunks = [];
        response.on('data', chunk => {
          chunks.push(chunk);
        });
        // When response arrives:
        response.on('end', () => {
          // If the response was JSON-formatted:
          try {
            const jobJSON = chunks.join('');
            const job = JSON.parse(jobJSON);
            // Make it the response of the watchee.
            return resolve(job);
          }
          // Otherwise, i.e. if the response was not JSON-formatted:
          catch(error) {
            // Make an error report the response of the watchee.
            const errorMessage = `ERROR: Response of ${watchJobURL} was not JSON`;
            console.log(errorMessage);
            return resolve({
              error: errorMessage,
              message: error.message,
              status: response.statusCode
            });
          }
        });
      });
      // If the check threw an error:
      request.on('error', error => {
        // Make an error report the response of the watchee.
        const errorMessage = `ERROR checking ${watchJobURL} for a network job`;
        console.log(`${errorMessage} (${error.message})`);
        return resolve({
          error: errorMessage,
          message: error.message
        });
      })
      .on('timeout', () => {
        const errorMessage = `ERROR: Request to ${watchJobURL} timed out`;
        console.log(errorMessage);
        return resolve({
          error: errorMessage
        });
      });
      response.on('error', error => {
        resolve({
          error: 'ERROR getting network job',
          message: error.message,
          status: response.statusCode
        });
      });
      request.end();
    });
    console.log('Check done');
    // If the watchee sent a job:
    if (job.id) {
      // Stop checking and return it.
      console.log(`Network job ${job.id} received from ${watchJobURL} (${nowString()})`);
      return job;
    }
    // Otherwise, if the watchee sent a message:
    else if (job.message) {
      // Report it and continue checking.
      console.log(job.message);
    }
    // Otherwise, i.e. if the watchee sent neither a job nor a message:
    else {
      // Report this and continue checking.
      console.log(`No network job at ${watchJobURL} to do (${nowString()})`);
    }
  }
  // If no watchee sent a job, return this.
  return {};
};
// Writes a directory report.
const writeDirReport = async report => {
  const jobID = report && report.id;
  if (jobID) {
    try {
      const reportJSON = JSON.stringify(report, null, 2);
      const reportName = `${jobID}.json`;
      const rawDir = `${reportDir}/raw`;
      await fs.writeFile(`${rawDir}/${reportName}`, reportJSON);
      console.log(`Report ${reportName} saved in ${rawDir}`);
    }
    catch(error) {
      console.log(`ERROR: Failed to write report (${error.message})`);
    }
  }
  else {
    console.log('ERROR: Job has no ID');
  }
};
// Submits a network report to a server and returns the server response.
const writeNetReport = async report => {
  const ack = await new Promise(resolve => {
    if (report.sources) {
      // If the report specifies where to send it:
      const destination = report.sources.sendReportTo;
      if (destination) {
        // Send it.
        const client = destination.startsWith('https://') ? https : http;
        const request = client.request(destination, {method: 'POST'}, response => {
          const chunks = [];
          response.on('data', chunk => {
            chunks.push(chunk);
          });
          response.on('end', () => {
            const content = chunks.join('');
            try {
              resolve(JSON.parse(content));
            }
            catch(error) {
              resolve({
                error: 'ERROR: Response was not JSON',
                message: error.message,
                status: response.statusCode,
                content: content.slice(0, 3000)
              });
            }
          });
        });
        report.jobData.agent = agent;
        request.on('error', error => {
          console.log(`ERROR submitting job report (${error.message})`);
          resolve({
            error: 'ERROR: Job report submission failed',
            message: error.message
          });
        });
        const reportJSON = JSON.stringify(report, null, 2);
        request.end(reportJSON);
        console.log(`Report ${report.id} submitted (${nowString()})`);
      }
      // Otherwise, i.e. if the report does not specify where to send it:
      else {
        // Report this.
        console.log('ERROR: Report specifies no submission destination');
      }
    }
    else {
      console.log('ERROR: Report has no sources property');
    }
  });
  // Return the server response.
  return ack;
};
// Archives a job.
const archiveJob = async (job, watchee) => {
  const jobJSON = JSON.stringify(job, null, 2);
  const watchJobDir = watchee || jobDir;
  await fs.writeFile(`${watchJobDir}/done/${job.id}.json`, jobJSON);
  await fs.rm(`${watchJobDir}/todo/${job.id}.json`);
};
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
// Runs a job.
const runJob = async (job, isDirWatch) => {
  // If the job has an ID:
  const {id} = job;
  if (id) {
    try {
      // Run the job, adding to the report.
      await doJob(job);
      // If a directory was watched:
      if (isDirWatch) {
        // Save the report.
        await writeDirReport(job);
      }
      // Otherwise, i.e. if the network was watched:
      else {
        // Send the report to the server.
        const ack = await writeNetReport(job);
        console.log(JSON.stringify(ack, null, 2));
      }
    }
    // If the job failed:
    catch(error) {
      // Report this.
      console.log(`ERROR: ${error.message}\n${error.stack}`);
    }
  }
  // Otherwise, i.e. if the job has no ID:
  else {
    // Report this.
    console.log('ERROR: Job has no id');
  }
};
// Checks for a job, performs it, and submits a report, once or repeatedly.
exports.cycle = async (isDirWatch, isForever, interval = 300, watchee = null) => {
  let statusOK = true;
  // Prevent a wait before the first iteration.
  let empty = false;
  const intervalMS = 1000 * Number.parseInt(interval);
  const intervalSpec = isForever ? `with intervals of ${interval} seconds when idle ` : '';
  console.log(`Watching started ${intervalSpec}(${nowString()})`);
  while (statusOK) {
    if (empty) {
      await wait(intervalMS);
    }
    // Check for a job.
    let job;
    if (isDirWatch) {
      job = await checkDirJob(watchee);
    }
    else {
      job = await checkNetJob(watchee);
    }
    // If there was one:
    if (job.id) {
      // Run it, save a report, and if applicable send the report to the job source.
      console.log(`Running job ${job.id} (${nowString()})`);
      await runJob(JSON.parse(JSON.stringify(job)), isDirWatch);
      console.log(`Job ${job.id} finished (${nowString()})`);
      // If a directory was watched:
      if (isDirWatch) {
        // Archive the job.
        await archiveJob(job, watchee);
        console.log(`Job ${job.id} archived (${nowString()})`);
      }
      // If watching was specified for only 1 job, quit.
      statusOK = isForever;
      // Prevent a wait before the next iteration.
      empty = false;
    }
    // Otherwise, i.e. if no job was found:
    else {
      // Cause a wait before the next check.
      empty = true;
    }
  }
  console.log(`Watching ended (${nowString()})`);
};
