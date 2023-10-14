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
const httpClient = require('http');
const httpsClient = require('https');

// ########## CONSTANTS

const protocol = process.env.PROTOCOL || 'http';
const client = protocol === 'http' ? httpClient : httpsClient;
const jobURLs = process.env.JOB_URLs;
const agent = process.env.AGENT;
const jobDir = process.env.JOBDIR;
const reportDir = process.env.REPORTDIR;
// Get a randomized array of servers to watch from the environment.
const watchees = jobURLs
.split('+')
.map(url => [Math.random(), url])
.sort((a, b) => a[0] - b[0])
.map(pair => pair[1]);

// ########## FUNCTIONS

// Returns a string representing the date and time.
const nowString = () => (new Date()).toISOString().slice(0, 19);
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
      console.log(`ERROR: Failed to write report ${jobID} (${error.message})`);
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
        console.log(`Sending report to ${destination}`);
        const request = client.request(destination, {method: 'POST'}, response => {
          const chunks = [];
          response.on('data', chunk => {
            chunks.push(chunk);
          });
          response.on('end', () => {
            const content = chunks.join('');
            try {
              const ack = JSON.parse(content);
              resolve(ack);
            }
            catch(error) {
              resolve({
                error: 'ERROR: Response was not JSON',
                message: error.message,
                status: response.statusCode,
                content: content.slice(0, 1000)
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
  return ack || {
    error: 'ERROR in server response'
  };
};
// Runs and reports a job.
const runJob = async (job, isDirWatch) => {
  // If the job has an ID:
  const {id} = job;
  if (id) {
    try {
      // Perform the job, adding to the report.
      await doJob(job);
      // If a directory was watched:
      if (isDirWatch) {
        // Save the report.
        await writeDirReport(job);
      }
      // Otherwise, i.e. if the network was watched:
      else {
        // Send the report to the server and report its response.
        const ack = await writeNetReport(job);
        console.log(`Server response to report submission:\n${JSON.stringify(ack, null, 2)}`);
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
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
// Archives a job.
const archiveJob = async job => {
  const {id} = job;
  const jobJSON = JSON.stringify(job, null, 2);
  await fs.writeFile(`${jobDir}/done/${id}.json`, jobJSON);
  await fs.rm(`${jobDir}/todo/${id}.json`);
};
// Checks for a directory job and, if found, performs and reports it, once or repeatedly.
const checkDirJob = async (interval) => {
  try {
    // If there are any jobs to do in the watched directory:
    watchDir ??= jobDir;
    const toDoFileNames = await fs.readdir(`${jobDir}/todo`);
    const jobFileNames = toDoFileNames.filter(fileName => fileName.endsWith('.json'));
    if (jobFileNames.length) {
      // Get the first one.
      const jobJSON = await fs.readFile(`${jobDir}/todo/${jobFileNames[0]}`, 'utf8');
      try {
        const job = JSON.parse(jobJSON, null, 2);
        const {id} = job;
        // Perform and report it.
        console.log(`Directory job ${id} found (${nowString()})`);
        await runJob(job, true);
        console.log(`Job ${id} finished (${nowString()})`);
        // Archive it.
        await archiveJob(job);
        console.log(`Job ${id} archived in ${watchDir} (${nowString()})`);
        // If watching is repetitive:
        if (interval > -1) {
          // Wait for the specified interval.
          await wait(1000 * interval);
          // Check the servers again.
          checkDirJob(watchDir, interval);
        }
      }
      catch(error) {
        console.log(`ERROR processing directory job (${error.message})`);
      }
    }
    // Otherwise, i.e. if there are no more jobs to do in the watched directory:
    else {
      console.log(`No job to do in ${watchDir} (${nowString()})`);
      // If checking is repetitive:
      if (interval > -1) {
        // Wait for the specified interval.
        await wait(1000 * interval);
        // Check the directory again.
        checkDirJob(watchDir, interval);
      }
    }
  }
  catch(error) {
    console.log(`ERROR: Directory watching failed (${error.message})`);
  }
};
// Checks servers for a job and, if obtained, performs and reports it, once or repeatedly.
const checkNetJob = async (watcheeIndex, interval) => {
  // If any servers remain to be checked:
  if (watcheeIndex < watchees.length) {
    // Request a job from the indexed server.
    const watchee = watchees[watcheeIndex];
    const logStart = `Asked ${watchee} for a job and got `;
    const wholeURL = `${watchee}?agent=${agent}`;
    const request = client.request(wholeURL, {timeout: 1000}, response => {
      const chunks = [];
      response.on('data', chunk => {
        chunks.push(chunk);
      })
      // When the response is completed:
      .on('end', async () => {
        // If the response was JSON-formatted:
        const responseJSON = chunks.join('');
        try {
          const responseObj = JSON.parse(responseJSON);
          // If the watchee sent a job:
          if (responseObj.id) {
            const {id} = responseObj;
            // Perform and report it.
            console.log(`Network job ${id} received from ${watchJobURL} (${nowString()})`);
            await runJob(responseObj, false);
            console.log(`Job ${id} finished (${nowString()})`);
            // Archive it.
            await archiveJob(responseObj);
            console.log(`Job ${id} archived (${nowString()})`);
            // If watching is repetitive:
            if (interval > -1) {
              // Wait for the specified interval.
              await wait(1000 * interval);
              // Check the servers again.
              checkNetJob(0);
            }
          }
          // Otherwise, if the watchee sent a message:
          else if (responseObj.message) {
            // Report it.
            console.log(`${logStart} reply ${responseObj.message}`);
            // Check the next watchee.
            checkNetJob(watcheeIndex + 1);
          }
          // Otherwise, i.e. if the watchee sent neither a job nor a message:
          else {
            // Report this.
            console.log(`${logStart} reply ${responseJSON.slice(0, 1000)}`);
            // Check the next watchee.
            checkNetJob(watcheeIndex + 1);
          }
        }
        // Otherwise, i.e. if the response was not JSON-formatted:
        catch(error) {
          // Report the response.
          console.log(
            `${logStart} status ${response.statusCode} and reply ${responseJSON.slice(0, 1000)}`
          );
          // Check the next watchee.
          checkNetJob(watcheeIndex + 1);
        }
      })
      // If the response throws an error:
      .on('error', error => {
        // Report this.
        console.log(`${logStart} status code ${response.statusCode} and error ${error.message}`);
        // Check the next watchee.
        checkNetJob(watcheeIndex + 1);
      });
    });
    // Close the request.
    request.end();
    // If the request throws an error:
    request.on('error', error => {
      // Report this.
      console.log(`${logStart} error ${error.message}`);
      // Check the next watchee.
      checkNetJob(watcheeIndex + 1);
    })
    // If the request times out:
    .on('timeout', () => {
      // Report this.
      console.log(`${logStart} a timeout`);
      // Check the next watchee.
      checkNetJob(watcheeIndex + 1);
    });
  }
  // Otherwise, i.e. if no servers remain to be checked:
  else {
    // If checking is repetitive:
    if (interval > -1) {
      // Wait for the specified interval.
      await wait(1000 * interval);
      // Check the servers again.
      checkNetJob(0);
    }
  }
};
// Checks for a job, performs it, and submits a report, once or repeatedly.
exports.watch = async (isDirWatch, interval = 300) => {
  const intervalSpec = interval > -1 ? `repeatedly, with ${interval}-second intervals ` : '';
  console.log(`Watching started ${intervalSpec}(${nowString()})\n`);
  // Start the checking.
  await isDirWatch ? checkDirJob(jobDir, interval) : checkNetJob(0, interval);
  console.log(`Watching ended (${nowString()})`);
};
