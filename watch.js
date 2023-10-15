/*
  watch.js
  Module for watching for a job and running it when found.
*/

// ########## IMPORTS

const httpClient = require('http');

// ########## FUNCTIONS

// Returns a string representing the date and time.
const nowString = () => (new Date()).toISOString().slice(0, 19);
// Checks servers for a network job.
const checkNetJob = (serverIndex, interval) => {
  const request = httpClient.request('http://localhost:3008/testu', response => {
    console.log('Response fn being defined');
    const chunks = [];
    response.on('data', chunk => {
      chunks.push(chunk);
    })
    // When response arrives:
    .on('end', () => {
      // Report it.
      const content = chunks.join('');
      console.log(content);
      console.log(`Watching ended (${nowString()})`);
    });
  });
  console.log('About to close request');
  request.end();
  console.log('Closed request');
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
};
