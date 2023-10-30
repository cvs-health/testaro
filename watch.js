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
  watch.js
  Module for watching for a job and running it when found.
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Module to make requests to servers.
const httpClient = require('http');
const httpsClient = require('https');
// Module to perform jobs.
const {doJob} = require('./run');

// CONSTANTS

const jobDir = process.env.JOBDIR;
const jobURLs = process.env.JOB_URLS;
const reportDir = process.env.REPORTDIR;
const agent = process.env.AGENT;

// ########## FUNCTIONS

// Returns a string representing the date and time.
const nowString = () => (new Date()).toISOString().slice(0, 19);
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
// Serves an object in JSON format.
const serveObject = (object, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(object));
};
// Writes a directory report.
const writeDirReport = async report => {
  const jobID = report && report.id;
  if (jobID) {
    try {
      const reportJSON = JSON.stringify(report, null, 2);
      const reportName = `${jobID}.json`;
      await fs.mkdir(reportDir, {recursive: true});
      await fs.writeFile(`${reportDir}/${reportName}`, reportJSON);
      console.log(`Report ${reportName} saved in ${reportDir}`);
    }
    catch(error) {
      console.log(`ERROR: Failed to write report ${jobID} in ${reportDir} (${error.message})`);
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
  await fs.writeFile(`${jobDir}/done/${id}.json`, jobJSON);
  // If the job had been saved as a file in the todo subdirectory:
  if (isFile) {
    // Delete the file.
    await fs.rm(`${jobDir}/todo/${id}.json`);
  }
};
// Checks for a directory job and, if found, performs and reports it, once or repeatedly.
const checkDirJob = async (isForever, interval) => {
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
        await archiveJob(job, true);
        console.log(`Job ${id} archived in ${jobDir} (${nowString()})`);
        // If watching is repetitive:
        if (isForever) {
          // Wait 2 seconds.
          await wait(2000);
          // Check the directory again.
          checkDirJob(true, interval);
        }
      }
      catch(error) {
        console.log(`ERROR processing directory job (${error.message})`);
      }
    }
    // Otherwise, i.e. if there are no more jobs to do in the watched directory:
    else {
      console.log(`No job to do in ${jobDir} (${nowString()})`);
      // Wait for the specified interval.
      await wait(1000 * interval);
      // Check the directory again.
      await checkDirJob(true, interval);
    }
  }
  catch(error) {
    console.log(`ERROR: Directory watching failed (${error.message})`);
  }
};
// Checks servers for a network job.
const checkNetJob = async (servers, serverIndex, isForever, interval, noJobCount) => {
  // If all servers are jobless:
  if (noJobCount === servers.length) {
    // Wait for the specified interval.
    await wait(1000 * interval);
    // Reset the count of jobless servers.
    noJobCount = 0;
  }
  // Otherwise, i.e. if any server may still have a job:
  else {
    // Wait 2 seconds.
    await wait(2000);
  }
  // If the last server has been checked:
  serverIndex = serverIndex % servers.length;
  if (serverIndex === 0) {
    // Report this.
    console.log('--');
  }
  // Check the next server.
  const server = servers[serverIndex];
  const client = server.startsWith('https://') ? httpsClient : httpClient;
  const fullURL = `${server}?agent=${agent}`;
  const logStart = `Requested job from server ${server} and got `;
  // Tolerate unrecognized certificate authorities if the environment specifies.
  const ruOpt = process.env.REJECT_UNAUTHORIZED === 'false' ? {rejectUnauthorized: false} : {};
  client.request(fullURL, ruOpt, response => {
    const chunks = [];
    response
    // If the response to the job request threw an error:
    .on('error', async error => {
      // Report it.
      console.log(`${logStart}error message ${error.message}`);
      // Check the next server.
      await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
    })
    .on('data', chunk => {
      chunks.push(chunk);
    })
    // When the response arrives:
    .on('end', async () => {
      const content = chunks.join('');
      try {
        // If there was no job to do:
        let contentObj = JSON.parse(content);
        if (! Object.keys(contentObj).length) {
          // Report this.
          console.log(`No job to do at ${server}`);
          // Check the next server.
          await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
        }
        // Otherwise, i.e. if there was a job or a message:
        else {
          const {message, id, sources} = contentObj;
          // If the server sent a message, not a job:
          if (message) {
            // Report it.
            console.log(`${logStart}${message}`);
            // Check the next server.
            await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
          }
          // Otherwise, if the server sent a valid job:
          else if (id && sources && sources.target && sources.target.which) {
            // Add the agent to it.
            sources.agent = agent;
            // If the job specifies a report destination:
            const {sendReportTo} = sources;
            if (sendReportTo) {
              // Perform the job, adding result data to it.
              const testee = sources.target.which;
              console.log(
                `${logStart}job ${id} (${nowString()})\n>> It will test ${testee}\n>> It will send report to ${sendReportTo}\n`
              );
              await doJob(contentObj);
              let reportJSON = JSON.stringify(contentObj, null, 2);
              console.log(`Job ${id} finished (${nowString()})`);
              // Send the report to the specified server.
              console.log(`Sending report ${id} to ${sendReportTo}`);
              const reportClient = sendReportTo.startsWith('https://') ? httpsClient : httpClient;
              const reportLogStart = `Sent report ${id} to ${sendReportTo} and got `;
              reportClient.request(sendReportTo, {method: 'POST'}, repResponse => {
                const chunks = [];
                repResponse
                // If the response to the report threw an error:
                .on('error', async error => {
                  // Report this.
                  console.log(`${reportLogStart}error message ${error.message}\n`);
                  // Check the next server.
                  await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
                })
                .on('data', chunk => {
                  chunks.push(chunk);
                })
                // When the response arrives:
                .on('end', async () => {
                  const content = chunks.join('');
                  try {
                    // If the server sent a message, as expected:
                    const ackObj = JSON.parse(content);
                    const {message} = ackObj;
                    if (message) {
                      // Report it.
                      console.log(`${reportLogStart}${message}\n`);
                      // Free the memory used by the report.
                      reportJSON = '';
                      contentObj = {};
                      // Check the next server.
                      await checkNetJob(servers, serverIndex + 1, isForever, interval, 0);
                    }
                    // Otherwise, i.e. if the server sent anything else:
                    else {
                      // Report it.
                      console.log(
                        `ERROR: ${reportLogStart}status ${repResponse.statusCode} and error message ${JSON.stringify(ackObj, null, 2)}\n`
                      );
                      // Check the next server, disregarding the failed job.
                      await checkNetJob(
                        servers, serverIndex + 1, isForever, interval, noJobCount + 1
                      );
                    }
                  }
                  // If processing the report threw an error:
                  catch(error) {
                    // Report it.
                    console.log(
                      `ERROR: ${reportLogStart}status ${repResponse.statusCode}, error message ${error.message}, and response ${content.slice(0, 1000)}\n`
                    );
                    // Check the next server, disregarding the failed job.
                    await checkNetJob(
                      servers, serverIndex + 1, isForever, interval, noJobCount + 1
                    );
                  }
                });
              })
              // If the report submission throws an error:
              .on('error', async error => {
                // Report this.
                console.log(`ERROR: ${reportLogStart}error message ${error.message}\n`);
                // Check the next server, disregarding the failed job.
                await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
              })
              // Finish submitting the report.
              .end(reportJSON);
            }
            // Otherwise, i.e. if the job specifies no report destination:
            else {
              // Report this.
              const message = `ERROR: ${logStart}job with no report destination`;
              serveObject({message}, response);
              console.log(message);
              // Check the next server, disregarding the defective job.
              await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
            }
          }
          // Otherwise, if the server sent an invalid job:
          else {
            // Report this.
            const message
            = `ERROR: ${logStart}invalid job:\n${JSON.stringify(contentObj, null, 2)}`;
            console.log(message);
            serveObject({message}, response);
            // Check the next server, disregarding the defective job.
            await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
          }
        }
      }
      // If an error is thrown:
      catch(error) {
        // Report this.
        console.log(`ERROR: ${error.message} (response ${content.slice(0, 1000)})`);
        // Check the next server.
        await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
      }
    });
  })
  // If the job request throws an error:
  .on('error', async error => {
    // If it was a refusal to connect:
    const {message} = error;
    if (message.includes('ECONNREFUSED')) {
      // Report this.
      console.log(`${logStart}no connection`);
      // Check the next server.
      await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
    }
    // Otherwise, if it was a DNS failure:
    else if (message.includes('ENOTFOUND')) {
      // Report this.
      console.log(`${logStart}no domain name resolution`);
      // Check the next server.
      await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
    }
    // Otherwise, i.e. if it was any other error:
    else {
      // Report this.
      console.log(`ERROR: ${logStart}no response, but got error message ${error.message}`);
      // Check the next server.
      await checkNetJob(servers, serverIndex + 1, isForever, interval, noJobCount + 1);
    }
  })
  // Finish sending the request.
  .end();
};
// Composes an interval description.
const intervalSpec = interval => {
  if (interval > -1) {
    return `repeatedly, with ${interval}-second intervals `;
  }
  else {
    return '';
  }
};
// Checks for a directory job, performs it, and submits a report, once or repeatedly.
exports.dirWatch = async (isForever, interval = 300) => {
  console.log(`Directory watching started ${intervalSpec(interval)}(${nowString()})\n`);
  // Start the checking.
  await checkDirJob(isForever, interval);
};
// Checks for a network job, performs it, and submits a report, once or repeatedly.
exports.netWatch = async (isForever, interval = 300) => {
  console.log('Starting netWatch');
  // If the servers to be checked are valid:
  const servers = jobURLs
  .split('+')
  .map(url => [Math.random(), url])
  .sort((a, b) => a[0] - b[0])
  .map(pair => pair[1]);
  if (
    servers
    && servers.length
    && servers
    .every(server => ['http://', 'https://'].some(prefix => server.startsWith(prefix)))
  ) {
    console.log(`Network watching started ${intervalSpec(interval)}(${nowString()})\n`);
    // Start checking.
    await checkNetJob(servers, 0, isForever, interval, 0);
  }
  else {
    console.log('ERROR: List of job URLs invalid');
  }
};
