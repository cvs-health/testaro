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

const jobURLs = process.env.JOB_URLs;
const agent = process.env.AGENT;
const jobDir = process.env.JOBDIR;
const reportDir = process.env.REPORTDIR;
// Get a randomized array of servers to watch from the environment.
const servers = jobURLs
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
      await fs.mkdir(rawDir, {recursive: true});
      await fs.writeFile(`${rawDir}/${reportName}`, reportJSON);
      console.log(`Report ${reportName} saved in ${rawDir}`);
    }
    catch(error) {
      console.log(`ERROR: Failed to write report ${jobID} in ${rawDir} (${error.message})`);
    }
  }
  else {
    console.log('ERROR: Job has no ID');
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
    const toDoFileNames = await fs.readdir(`${jobDir}/todo`);
    const jobFileNames = toDoFileNames.filter(fileName => fileName.endsWith('.json'));
    if (jobFileNames.length) {
      // Get the first one.
      const jobJSON = await fs.readFile(`${jobDir}/todo/${jobFileNames[0]}`, 'utf8');
      try {
        const job = JSON.parse(jobJSON, null, 2);
        const {id} = job;
        // Perform it.
        console.log(`Directory job ${id} found (${nowString()})`);
        await doJob(job);
        console.log(`Job ${id} finished (${nowString()})`);
        // Report it.
        await writeDirReport(job);
        // Archive it.
        await archiveJob(job);
        console.log(`Job ${id} archived in ${jobDir} (${nowString()})`);
        // If watching is repetitive:
        if (interval > -1) {
          // Wait for the specified interval.
          await wait(1000 * interval);
          // Check the servers again.
          checkDirJob(interval);
        }
      }
      catch(error) {
        console.log(`ERROR processing directory job (${error.message})`);
      }
    }
    // Otherwise, i.e. if there are no more jobs to do in the watched directory:
    else {
      console.log(`No job to do in ${jobDir} (${nowString()})`);
      // If checking is repetitive:
      if (interval > -1) {
        // Wait for the specified interval.
        await wait(1000 * interval);
        // Check the directory again.
        await checkDirJob(interval);
      }
    }
  }
  catch(error) {
    console.log(`ERROR: Directory watching failed (${error.message})`);
  }
};
// Checks servers for a job and, if obtained, performs and reports it, once or repeatedly.
const checkNetJob = (serverIndex, interval) => {
  // If any servers remain to be checked:
  if (serverIndex < servers.length) {
    // Request a job from the indexed server.
    const server = servers[serverIndex];
    const logStart = `Asked ${server} for a job and got `;
    const wholeURL = `${server}?agent=${agent}`;
    let client = server.startsWith('https://') ? httpsClient : httpClient;
    console.log(`About to make request to ${wholeURL}`);
    httpClient.request(
      'http://localhost:8000', response => console.log(JSON.stringify(response, null, 2))
    ).end();
    /*
    const jobRequest = client.request(wholeURL, {timeout: 1000}, response => {
      console.log('Request made');
      console.log(`Status: ${response.statusCode}`);
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
          // If the server sent a valid job:
          const {id, sources} = responseObj;
          if (id && sources) {
            const {sendReportTo} = sources;
            if (sendReportTo) {
              console.log(`Network job ${id} received from ${server} (${nowString()})`);
              // Perform it.
              await doJob(responseObj);
              console.log(`Job ${id} finished (${nowString()})`);
              // Send the report to the server and report its response.
              console.log(`Sending report to ${sendReportTo}`);
              client = sendReportTo.startsWith('https://') ? httpsClient : httpClient;
              const request = client.request(sendReportTo, {method: 'POST'}, response => {
                const chunks = [];
                response.on('data', chunk => {
                  chunks.push(chunk);
                });
                // When the response arrives:
                response.on('end', async () => {
                  const content = chunks.join('');
                  const logStart = `Sent report to ${sendReportTo} and got `;
                  try {
                    const ack = JSON.parse(content);
                    console.log(`${logStart}${ack}`);
                    // Archive the job.
                    await archiveJob(responseObj);
                    console.log(`Job ${id} archived (${nowString()})`);
                    // If watching is repetitive:
                    if (interval > -1) {
                      // Wait for the specified interval.
                      await wait(1000 * interval);
                      // Check the next server.
                      await checkNetJob(serverIndex + 1, interval);
                    }
                  }
                  catch(error) {
                    console.log(
                      `ERROR: ${logStart}status ${response.statusCode}, error message ${error.message}, and body ${content.slice(0,1000)}`
                    );
                  }
                });
              })
              .on('error', error => {
                console.log(`ERROR submitting job report (${error.message})`);
              });
              report.jobData.agent = agent;
              const reportJSON = JSON.stringify(report, null, 2);
              request.end(reportJSON);
            }
            // Otherwise, if the server sent a job without a report destination:
            else {
              // Report this.
              console.log(`ERROR: ${logStart}a job with no report destination`);
            }
          }
          // Otherwise, if the server sent a message instead of a job:
          else if (responseObj.message) {
            // Report it.
            console.log(`${logStart}${responseObj.message}`);
          }
          // Otherwise, if the server sent any other JSON response:
          else {
            // Report it.
            console.log(`${logStart} ${JSON.stringify(responseObj, null, 2)}`);
            // Check the next server.
            await checkNetJob(serverIndex + 1, interval);
          }
        }
        catch(error) {
          // Report any error.
          console.log(
            `${logStart}status ${response.statusCode} and reply ${responseJSON.slice(0, 1000)}`
          );
          // Check the next server.
          await checkNetJob(serverIndex + 1, interval);
        }
      })
      // If the response throws an error:
      .on('error', async error => {
        // Report it.
        console.log(
          `${logStart}status code ${response.statusCode} and error message ${error.message}`
        );
        // Check the next server.
        await checkNetJob(serverIndex + 1, interval);
      });
    })
    // If the request throws an error:
    .on('error', async error => {
      // Report it.
      console.log(`${logStart} error ${error.message}`);
      // Check the next server.
      await checkNetJob(serverIndex + 1, interval);
    })
    // If the request times out:
    .on('timeout', async () => {
      // Report this.
      console.log(`${logStart} a timeout`);
      // Check the next server.
      await checkNetJob(serverIndex + 1, interval);
    });
    // Close the request.
    jobRequest.end();
    console.log(`Request to ${server} ended`);
  }
  // Otherwise, i.e. if no servers remain to be checked:
  else {
    // If checking is repetitive:
    if (interval > -1) {
      // Wait for the specified interval.
      await wait(1000 * interval);
      // Check the servers again.
      await checkNetJob(0, interval);
    }
  */
  }
};
// Checks for a job, performs it, and submits a report, once or repeatedly.
exports.watch = async (isDirWatch, interval = 300) => {
  const intervalSpec = interval > -1 ? `repeatedly, with ${interval}-second intervals ` : '';
  console.log(`Watching started ${intervalSpec}(${nowString()})\n`);
  // Start the checking.
  if (isDirWatch) {
    await checkDirJob(interval);
  }
  else {
    checkNetJob(0, interval);
  }
  console.log(`Watching ended (${nowString()})`);
};
