/*
  watch.js
  Module for watching for a job and running it when found.
*/

// ########## IMPORTS

// Module to read and write files.
const fs = require('fs/promises');
// Module to make requests to servers.
const httpClient = require('http');
const httpsClient = require('https');

// CONSTANTS

const jobDir = process.env.JOBDIR;
const jobURLs = process.env.JOB_URLS;
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
// Checks servers for a network job.
const checkNetJob = async (servers, serverIndex, interval) => {
  if (serverIndex < servers.length) {
    const server = servers[serverIndex];
    const client = server.startsWith('https://') ? httpsClient : httpClient;
    const fullURL = `${servers[serverIndex]}?agent=${agent}`;
    const request = client.request(fullURL, response => {
      const chunks = [];
      response.on('data', chunk => {
        chunks.push(chunk);
      })
      // When response arrives:
      .on('end', async () => {
        // Report it.
        const content = chunks.join('');
        console.log(`Server ${server} replied:\n${content.slice(0, 500)}`);
        await wait(2000);
        checkNetJob(servers, serverIndex + 1, interval);
      });
    });
    request.end();
  }
  else {
    await wait(1000* interval);
    checkNetJob(servers, 0, interval);
  }
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
exports.dirWatch = async (interval = 300) => {
  console.log(`Directory watching started ${intervalSpec(interval)}(${nowString()})\n`);
  // Start the checking.
  await checkDirJob(interval);
};
// Checks for a network job, performs it, and submits a report, once or repeatedly.
exports.netWatch = (interval = 300) => {
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
    .every(server => ['http://', 'https://', 'file://'].some(prefix => server.startsWith(prefix)))
  ) {
    console.log(`Network watching started ${intervalSpec(interval)}(${nowString()})\n`);
    // Start the checking.
    checkNetJob(servers, 0, interval);
  }
  else {
    console.log('ERROR: List of job URLs invalid');
  }
};
