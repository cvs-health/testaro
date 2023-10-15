/*
  watch.js
  Module for watching for a job and running it when found.
*/

// ########## IMPORTS

const httpClient = require('http');

// ########## FUNCTIONS

exports.checkNetJob = () => {
  const request = httpClient.request('http://localhost:3008/testu', response => {
    const chunks = [];
    response.on('data', chunk => {
      chunks.push(chunk);
    })
    // When response arrives:
    .on('end', () => {
      // Report it.
      const content = chunks.join('');
      console.log(content);
    });
  });
  request.end();
};
exports.checkNetJob();
