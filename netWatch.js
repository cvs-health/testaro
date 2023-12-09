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
  netWatch.js
  Module for watching for a network job and running it when found.
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Modules to make requests to servers.
const httpClient = require('http');
const httpsClient = require('https');
// Module to perform jobs.
const {doJob} = require('./run');

// CONSTANTS

const jobURLSpec = process.env.JOB_URLS;
const agent = process.env.AGENT;

// ########## FUNCTIONS

// Returns a string representing the date and time.
const nowString = () => (new Date()).toISOString().slice(2, 15);
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
*/
exports.netWatch = async (isForever, interval, isCertTolerant) => {
  const jobURLs = jobURLSpec
  .split('+')
  .map(url => [Math.random(), url])
  .sort((a, b) => a[0] - b[0])
  .map(pair => pair[1]);
  // If the job URLs are valid:
  if (
    jobURLs
    && jobURLs.length
    && jobURLs
    .every(jobURL => ['http://', 'https://'].some(prefix => server.startsWith(prefix)))
  ) {
    // Configure the watch.
    let notYetRun = true;
    let serverIndex = 0;
    const urlCount = jobURLs.length;
    let cycleIndex = 0;
    let firstCheck = true;
    const logStart = `Requested job from server ${url} and got `;
    const certOpt = isCertTolerant ? {rejectUnauthorized: false} : {};
    let abort = false;
    console.log(`Network watching started with ${interval}-second intervals (${nowString()})\n`);
    // As long as watching as to continue:
    while ((isForever || notYetRun) && ! abort) {
      // If a cycle is not starting or this is the first check:
      if (cycleIndex || firstCheck) {
        // Wait briefly.
        wait (1000);
        firstCheck === false;
      }
      // Otherwise, i.e. if a cycle is starting after the first check:
      else {
        // Log this.
        console.log('--');
        // Wait for the specified interval.
        wait (1000 * interval);
      }
      // Configure the next check.
      const url = jobURLs[serverIndex];
      const fullURL = `${url}?agent=${agent}`;
      // Perform it.
      await new Promise(resolve => {
        try {
          const client = url.startsWith('https://') ? httpsClient : httpClient;
          // Request a job.
          client.request(fullURL, certOpt, response => {
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
              try {
                // If there was no job to do:
                let contentObj = JSON.parse(content);
                if (! Object.keys(contentObj).length) {
                  // Report this.
                  console.log(`No job to do at ${url}`);
                  resolve(true);
                }
                // Otherwise, i.e. if there was a job or a message:
                else {
                  const {message, id, sources} = contentObj;
                  // If the server sent a message, not a job:
                  if (message) {
                    // Report it.
                    console.log(`${logStart}${message}`);
                    resolve(true);
                  }
                  // Otherwise, if the server sent a valid job:
                  else if (id && sources && sources.target && sources.target.which) {
                    // Increment the server index.
                    serverIndex = ++serverIndex % urlCount;
                    // Restart the cycle with the next server.
                    cycleIndex = 0;
                    firstCheck = true;
                    // Add the agent to the job.
                    sources.agent = agent;
                    // If the job specifies a report destination:
                    const {sendReportTo} = sources;
                    if (sendReportTo) {
                      // Perform the job, adding result data to it.
                      const testee = sources.target.which;
                      console.log(`${logStart}job ${id} (${nowString()}`);
                      console.log(`>> It will test ${testee}`);
                      console.log(`>> It will send report to ${sendReportTo}`);
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
                          resolve(true);
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
                              resolve(true);
                            }
                            // Otherwise, i.e. if the server sent anything else:
                            else {
                              // Report it.
                              console.log(
                                `ERROR: ${reportLogStart}status ${repResponse.statusCode} and error message ${JSON.stringify(ackObj, null, 2)}\n`
                              );
                              resolve(true);
                            }
                          }
                          // If processing the server message throws an error:
                          catch(error) {
                            // Report it.
                            console.log(
                              `ERROR: ${reportLogStart}status ${repResponse.statusCode}, error message ${error.message}, and response ${content.slice(0, 1000)}\n`
                            );
                            resolve(true);
                          }
                        });
                      })
                      // If the report submission throws an error:
                      .on('error', async error => {
                        // Report this.
                        console.log(`ERROR: ${reportLogStart}error message ${error.message}\n`);
                        resolve(true);
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
                      resolve(true);
                    }
                  }
                  // Otherwise, if the server sent an invalid job:
                  else {
                    // Report this.
                    const message
                    = `ERROR: ${logStart}invalid job:\n${JSON.stringify(contentObj, null, 2)}`;
                    console.log(message);
                    serveObject({message}, response);
                    resolve(true);
                  }
                }
              }
              // If an error is thrown:
              catch(error) {
                // Report this.
                console.log(`ERROR: ${error.message} (response ${content.slice(0, 1000)})`);
                resolve(true);
              }
            });
          })
          // If the job request throws an error:
          .on('error', async error => {
            // If it is a refusal to connect:
            const {message} = error;
            if (message.includes('ECONNREFUSED')) {
              // Report this.
              console.log(`${logStart}no connection`);
            }
            // Otherwise, if it was a DNS failure:
            else if (message.includes('ENOTFOUND')) {
              // Report this.
              console.log(`${logStart}no domain name resolution`);
            }
            // Otherwise, i.e. if it was any other error:
            else {
              // Report this.
              console.log(
                `ERROR: ${logStart}no response, but got error message ${error.message.slice(0, 200)}`
              );
              // Abort the watch.
              abort = true;
            }
            resolve(true);
          })
          // Finish sending the request.
          .end();
        }
        catch(error) {
          console.log(`ERROR watching for network jobs (${error.message})`);
          abort = true;
          resolve(true);
        }
      });
    }
  }
  // Otherwise, i.e. if the job URLs are invalid:
  else {
    // Report this.
    console.log('ERROR: List of job URLs invalid');
  }
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
};
