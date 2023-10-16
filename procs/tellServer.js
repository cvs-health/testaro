/*
  tellServer
  Notify the server.
*/

// CONSTANTS

const httpClient = require('http');
const httpsClient = require('https');
const agent = process.env.AGENT;

// FUNCTIONS

// Send a notification to an observer.
exports.tellServer = (report, messageParams, logMessage) => {
  const observer = report.sources.sendReportTo.replace(/report$/, 'granular');
  const whoParams = `agent=${agent}&jobID=${report.id || ''}`;
  const wholeURL = `${observer}?${whoParams}&${messageParams}`;
  const client = wholeURL.startsWith('https://') ? httpsClient : httpClient;
  const request = client.request(wholeURL);
  // If the notification threw an error:
  request.on('error', error => {
    // Report the error.
    const errorMessage = 'ERROR notifying the server';
    console.log(`${errorMessage} (${error.message})`);
  });
  request.end();
  console.log(`${logMessage} (server notified)`);
};
