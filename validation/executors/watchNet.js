// watchDir.js
// Validator for directory watching.

const fs = require('fs/promises');
process.env.WATCH_TYPE = 'net';
process.env.INTERVAL = 5;
process.env.WATCH_FOREVER = false;
process.env.PROTOCOL = 'http';
process.env.JOB_URL = 'localhost:3007/job';
process.env.REPORT_URL = 'localhost:3007/report';
process.env.AUTHCODE = 'testarauth';
process.env.PROTOCOL = 'http';
const http = require('http');
// Start a timer.
const startTime = Date.now();
// Initialize the state.
let jobGiven = false;
// Start checking for jobs every 5 seconds in 5 seconds.
setTimeout(() => {
  require('../../watch');
}, 5000);
// Handles Testaro requests to the server.
const requestHandler = (request, response) => {
  const {method} = request;
  const bodyParts = [];
  request.on('error', err => {
    console.error(err);
  })
  .on('data', chunk => {
    bodyParts.push(chunk);
  })
  .on('end', async () => {
    // Remove any trailing slash from the URL.
    const requestURL = request.url.replace(/\/$/, '');
    // If the request method is GET:
    if (method === 'GET') {
      // If a job is validly requested:
      if (requestURL === '/job?authcode=testarauth') {
        // If at least 7 seconds has elapsed since timing started:
        if (Date.now() > startTime + 7000) {
          // Respond with a job.
          const jobJSON = await fs.readFile(`${__dirname}/../protoJobs/simple1.json`);
          await response.end(jobJSON);
          jobGiven = true;
        }
      }
      else {
        const error = {
          error: 'ERROR: Job request invalid'
        };
        const errorJSON = JSON.stringify(error);
        await response.end(errorJSON);
      }
    }
    // Otherwise, if the request method is POST:
    else if (method === 'POST') {
      const ack = {};
      // If a report is validly submitted:
      if (requestURL === '/report?authcode=testarauth') {
        // If a job was earlier given to Testaro:
        if (jobGiven) {
          try {
            const bodyJSON = bodyParts.join('');
            const body = JSON.parse(bodyJSON);
            if (body.jobID && body.script && body.acts) {
              ack.result = 'Success: Report submitted';
            }
            else {
              ack.result = 'Failure: Report invalid';
            }
          }
          catch(error) {
            ack.result = `ERROR: ${error.message}`;
          }
        }
      }
      else {
        ack.result = 'ERROR: Report submission invalid';
      }
      const ackJSON = JSON.stringify(ack);
      response.end(ackJSON);
    }
  });
};
// Create a server.
const server = http.createServer({}, requestHandler);
// Start a server listening for Testaro requests.
server.listen(3007, () => {
  console.log('Job server listening on port 3007');
  // Send a job to Testaro on request after 7 seconds.
  setTimeout(() => {
    fs.copyFile(`${__dirname}/../protoJobs/simple1.json`, `${__dirname}/../jobs/val1.json`);
    console.log('Job copied into job directory after 7 seconds');
  }, 7000);
});
// Start checking for jobs every 5 seconds.
require('../../watch');
// Copy a job into JOBDIR after 7 seconds.
setTimeout(() => {
  fs.copyFile(`${__dirname}/../protoJobs/simple1.json`, `${__dirname}/../jobs/val1.json`);
  console.log('Job copied into job directory after 7 seconds');
}, 7000);
