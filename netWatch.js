/*
  © 2022–2024 CVS Health and/or one of its affiliates. All rights reserved.

  MIT License

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
  netWatch.js
  Module for watching for a network job and running it when found.
*/

// IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to validate jobs.
const {isValidJob} = require('./procs/job');
// Modules to make requests to servers.
const httpClient = require('http');
const httpsClient = require('https');
// Module to perform jobs.
const {doJob} = require('./run');

// CONSTANTS

const jobURLSpec = process.env.JOB_URLS;

// FUNCTIONS

// Returns a string representing the date and time.
const nowString = () => (new Date()).toISOString().slice(2, 16);
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
/*
  Requests a network job and, when found, performs and reports it.
  Arguments:
  0. whether to continue watching after a job is run.
  1: interval in seconds from a cycle of no-job checks to the next cycle.
  2. whether to ignore unknown-certificate errors from watched servers.
*/
exports.netWatch = async (isForever, intervalInSeconds, isCertTolerant = true) => {
  const urls = jobURLSpec
  .split('+')
  .map(url => [Math.random(), url])
  .sort((a, b) => a[0] - b[0])
  .map(pair => pair[1]);
  const urlCount = urls.length;
  // If the job URLs exist and are valid:
  if (
    urls
    && urlCount
    && urls.every(url => ['http://', 'https://'].some(prefix => url.startsWith(prefix)))
  ) {
    // Configure the watch.
    let cycleIndex = -1;
    let urlIndex = -1;
    let noJobYet = true;
    let abort = false;
    const certOpt = isCertTolerant ? {rejectUnauthorized: false} : {};
    const certInfo = `Certificate-${isCertTolerant ? '' : 'in'}tolerant`;
    const foreverInfo = isForever ? 'repeating' : 'one-job';
    const intervalInfo = `with ${intervalInSeconds}-second intervals`;
    console.log(
      `${certInfo} ${foreverInfo} network watching started ${intervalInfo} (${nowString()})\n`
    );
    // As long as watching is to continue:
    while ((isForever || noJobYet) && ! abort) {
      // If the cycle is complete:
      if (cycleIndex === urlCount - 1) {
        // Wait for the specified interval.
        await wait(1000 * intervalInSeconds);
        // Log the start of a cycle.
        console.log('--');
      }
      // Otherwise, i.e. if the cycle is incomplete:
      else {
        // Wait briefly.
        await wait(1000);
      }
      // Configure the next check.
      cycleIndex = ++cycleIndex % urlCount;
      urlIndex = ++urlIndex % urlCount;
      const url = urls[urlIndex];
      const publicURL = url.replace(/[?/][^?/.]+$/, '');
      const logStart = `Requested job from ${publicURL} and got `;
      // Perform it.
      await new Promise(resolve => {
        try {
          const client = url.startsWith('https://') ? httpsClient : httpClient;
          // Request a job.
          client.request(url, certOpt, response => {
            const chunks = [];
            response
            // If the response throws an error:
            .on('error', async error => {
              // Report it.
              console.log(`${logStart}error message ${error.message}`);
              resolve(true);
            })
            .on('data', chunk => {
              chunks.push(chunk);
            })
            // When the response arrives:
            .on('end', async () => {
              const content = chunks.join('');
              // It should be JSON. If it is:
              try {
                let contentObj = JSON.parse(content);
                const {id, sendReportTo, sources} = contentObj;
                // If it is empty:
                if (! Object.keys(contentObj).length) {
                  // Report this.
                  console.log(`${logStart}no job to do`);
                  resolve(true);
                }
                // Otherwise, i.e. if it is a job:
                else if (id) {
                  // Check it for validity.
                  const jobInvalidity = isValidJob(contentObj);
                  // If it is invalid:
                  if (jobInvalidity) {
                    // Report this to the server.
                    serveObject({
                      message: `invalidJob`,
                      jobInvalidity
                    }, response);
                    console.log(`${logStart}invalid job (${jobInvalidity})`);
                    resolve(true);
                  }
                  // Otherwise, i.e. if it is valid:
                  else {
                    // Restart the cycle.
                    cycleIndex = -1;
                    // Prevent further watching, if unwanted.
                    noJobYet = false;
                    // Add the agent to the job.
                    sources.agent = process.env.AGENT || '';
                    // Perform the job and create a report.
                    console.log(`${logStart}job ${id} for ${sendReportTo} (${nowString()})`);
                    const report = await doJob(contentObj);
                    let reportJSON = JSON.stringify(report, null, 2);
                    console.log(`Job ${id} finished (${nowString()})`);
                    const reportClient = sendReportTo.startsWith('https://')
                      ? httpsClient
                      : httpClient;
                    // Initialize the report destination as the sendReportTo property of the job.
                    let reportDest = sendReportTo;
                    // If it contains a placeholder:
                    if (/\[A-Z_]+\]$/.test(sendReportTo)) {
                      // Replace the placeholder with the value of the environment variable it names.
                      reportDest = `${sendReportTo.replace(/\[([^]]+\])/, process.env[$1])}`;
                    }
                    const reportLogStart = `Did job ${id}, sent report, and got `;
                    // Send the report there.
                    reportClient.request(reportDest, {method: 'POST'}, repResponse => {
                      const chunks = [];
                      repResponse
                      // If the response to the report threw an error:
                      .on('error', async error => {
                        // Report this.
                        console.log(`${reportLogStart}error message ${error.message}\n`);
                        resolve(true);
                      })
                      .on('data', chunk => {
                        chunks.push(chunk);
                      })
                      // When the response to the report arrives:
                      .on('end', async () => {
                        const content = chunks.join('');
                        // It should be JSON. If it is:
                        try {
                          const ackObj = JSON.parse(content);
                          // Report it.
                          console.log(
                            `${reportLogStart}response message: ${JSON.stringify(ackObj, null, 2)}\n`
                          );
                        }
                        // Otherwise, i.e. if it is not JSON:
                        catch(error) {
                          // Report it.
                          console.log(
                            `ERROR: ${reportLogStart}status ${repResponse.statusCode}, error message ${error.message}, and response ${content.slice(0, 1000)}\n`
                          );
                        }
                        // Free the memory used by the job and the report.
                        contentObj = {};
                        reportJSON = '';
                        resolve(true);
                      });
                    })
                    // If the report submission throws an error:
                    .on('error', async error => {
                      // Report this.
                      console.log(
                        `ERROR in report submission: ${reportLogStart}error message ${error.message}\n`
                      );
                      resolve(true);
                    })
                    // Finish submitting the report.
                    .end(reportJSON);
                  }
                }
                // Otherwise, i.e. if it is a message:
                else {
                  // Report it.
                  console.log(`${logStart}${JSON.stringify(contentObj, null, 2)}`);
                  resolve(true);
                }
              }
              // Otherwise, i.e. if it is not JSON:
              catch(error) {
                // Report this.
                console.log(`ERROR: Job request got non-JSON response (${error.message})`);
                resolve(true);
              };
            });
          })
          // If the job request throws an error:
          .on('error', async error => {
            // If it is a refusal to connect:
            if (error.code && error.code.includes('ECONNREFUSED')) {
              // Report this.
              console.log(`${logStart}no connection`);
            }
            // Otherwise, if it was a DNS failure:
            else if (error.code && error.code.includes('ENOTFOUND')) {
              // Report this.
              console.log(`${logStart}no domain name resolution`);
            }
            // Otherwise, if it was any other error with a message:
            else if (error.message) {
              // Report this.
              console.log(`ERROR: ${logStart}got error message ${error.message.slice(0, 200)}`);
              // Abort the watch.
              abort = true;
            }
            // Otherwise, i.e. if it was any other error with no message:
            else {
              // Report this.
              console.log(`ERROR: ${logStart}got an error with no message`);
              // Abort the watch.
              abort = true;
            }
            resolve(true);
          })
          // Finish sending the job request.
          .end();
        }
        // If requesting a job throws an error:
        catch(error) {
          // Report this.
          console.log(`ERROR requesting a network job (${error.message})`);
          abort = true;
          resolve(true);
        }
      });
    }
    console.log('Watching complete');
  }
  // Otherwise, i.e. if the job URLs do not exist or are invalid:
  else {
    // Report this.
    console.log('ERROR: List of job URLs invalid');
  }
};
