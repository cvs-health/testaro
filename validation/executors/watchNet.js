// watchDir.js
// Validator for network watching.

const fs = require('fs/promises');
process.env.WATCH_TYPE = 'net';
process.env.INTERVAL = 5;
process.env.WATCH_FOREVER = false;
process.env.PROTOCOL = 'http';
process.env.JOB_URL = 'localhost:3007/job';
process.env.REPORT_URL = 'localhost:3007/report';
process.env.AUTH_CODE = 'testarauth';
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
let server;
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
      console.log('Server got a job request from Testaro');
      if (requestURL === '/job?authCode=testarauth') {
        // If at least 7 seconds has elapsed since timing started:
        if (Date.now() > startTime + 7000) {
          // Respond with a job.
          const jobJSON = await fs.readFile(`${__dirname}/../protoJobs/val1.json`);
          await response.end(jobJSON);
          console.log('Server sent job val1 to Testaro');
          jobGiven = true;
        }
        // Otherwise, i.e. if timing started less than 7 seconds ago:
        else {
          // Send an empty-object response.
          await response.end('{}');
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
      console.log('Server got report from Testaro');
      const ack = {};
      // If a report is validly submitted:
      if (requestURL === '/report?authCode=testarauth') {
        // If a job was earlier given to Testaro:
        if (jobGiven) {
          // Respond, reporting success or failure.
          try {
            const bodyJSON = bodyParts.join('');
            const body = JSON.parse(bodyJSON);
            if (body.jobID && body.script && body.acts) {
              ack.result = 'Success: Valid report submitted';
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
      console.log(`Server responded: ${ack.result}`);
      // This ends the validation, so stop the server.
      server.close();
      console.log('Server closed');
    }
  });
};
// Create a server.
server = http.createServer({}, requestHandler);
// Start a server listening for Testaro requests.
server.listen(3007, () => {
  console.log('Job and report server listening on port 3007');
});
// Start checking for jobs every 5 seconds.
require('../../watch');
