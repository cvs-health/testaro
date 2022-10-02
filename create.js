/*
  create.js
  Creates and runs a file-based job and writes a report file.
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
const {fork} = require('child_process');
const {handleRequest} = require('./run');
// Module to convert a script and a batch to a batch-based array of scripts.
const {batchify} = require('./batchify');

// ########## CONSTANTS

const scriptDir = process.env.SCRIPTDIR;
const batchDir = process.env.BATCHDIR;
const reportDir = process.env.REPORTDIR;
const successHosts = [];
const crashHosts = [];
const timeoutHosts = [];

// ########## VARIABLES

let healthy = true;
// Set 5 minutes as a default time limit per host script.
let timeLimit = 300;
let reportCount = 0;
let specCount = Infinity;

// ########## FUNCTIONS

// Runs one script with no batch and writes a report file.
const runHost = async (id, script) => {
  const report = {
    id,
    host: {},
    log: [],
    script,
    acts: []
  };
  await handleRequest(report);
  const reportJSON = JSON.stringify(report, null, 2);
  await fs.writeFile(`${reportDir}/${id}.json`, reportJSON);
};
// Recursively runs host scripts.
const runHosts = async (timeStamp, specs) => {
  if (specs.length >= specCount) {
    console.log(`ERROR: Tried to run again with host count ${specs.length}`);
    return;
  }
  else {
    specCount = specs.length;
  }
  // If any host scripts remain to be run and the process has not been interrupted:
  if (specs.length && healthy) {
    // Remove the first host script from the list.
    const spec = specs.shift();
    const {id, host, script} = spec;
    // Fork a child process to run that host script.
    const subprocess = fork(
      'runHost', [id, JSON.stringify(script), JSON.stringify(host)],
      {
        detached: true,
        stdio: [0, 1, 'ignore', 'ipc']
      }
    );
    let runMoreTimer = null;
    // Let it run until it ends or, if the script or default time limit expires:
    const timer = setTimeout(async () => {
      clearTimeout(timer);
      // Record the host script as timed out.
      timeoutHosts.push(id);
      // Kill the child process.
      subprocess.kill('SIGKILL');
      console.log(`Script for host ${id} took more than ${timeLimit} seconds, so was killed`);
      // Wait 10 seconds. Then:
      runMoreTimer = setTimeout(async () => {
        clearTimeout(runMoreTimer);
        // If the timeout did not coincide with the termination of the script:
        if (! (successHosts.includes(id) || crashHosts.includes(id))) {
          // Run the remaining host scripts.
          console.log('Continuing with the remaining host scripts');
          await runHosts(timeStamp, specs);
        }
      }, 10000);
    }, 1000 * (script.timeLimit || timeLimit));
    // If the child process succeeds:
    subprocess.on('message', async message => {
      clearTimeout(runMoreTimer);
      clearTimeout(timer);
      // Save its report as a file.
      await fs.writeFile(`${reportDir}/${id}.json`, message);
      console.log(`Report ${id}.json saved in ${reportDir}`);
      reportCount++;
      successHosts.push(id);
      // Run the remaining host scripts.
      await runHosts(timeStamp, specs);
    });
    // If the child process ends:
    subprocess.on('exit', async () => {
      // Wait 5 seconds, then:
      const postExitTimer = setTimeout(async () => {
        clearTimeout(postExitTimer);
        // If its end was not due to success or a timeout:
        if (! (successHosts.includes(id) || timeoutHosts.includes(id))) {
          clearTimeout(runMoreTimer);
          clearTimeout(timer);
          // Record the host as having crashed.
          crashHosts.push(id);
          console.log(`Script for host ${id} crashed`);
          // Run the remaining host scripts.
          await runHosts(timeStamp, specs);
        }
      }, 5000);
    });
  }
  // Otherwise, i.e. if no more host scripts are to be run:
  else {
    // Report the metadata.
    console.log(`Count of ${timeStamp}- reports saved in ${reportDir}: ${reportCount}`);
    if (timeoutHosts.length) {
      console.log(`Hosts timed out:\n${JSON.stringify(timeoutHosts, null, 2)}`);
    }
    if (crashHosts.length) {
      console.log(`Hosts crashed:\n${JSON.stringify(crashHosts, null, 2)}`);
    }
    return '';
  }
};
// Runs a file-based job and writes a report file for the script or each host.
exports.runJob = async (scriptID, batchID) => {
  process.on('SIGINT', () => {
    console.log('ERROR: Terminal interrupted runJob');
    healthy = false;
  });
  if (scriptID) {
    try {
      const scriptJSON = await fs.readFile(`${scriptDir}/${scriptID}.json`, 'utf8');
      const script = JSON.parse(scriptJSON);
      // Get the time limit of the script or, if none, set it to 5 minutes.
      timeLimit = script.timeLimit || timeLimit;
      // Identify the start time and a timestamp.
      const timeStamp = Math.floor((Date.now() - Date.UTC(2022, 1)) / 2000).toString(36);
      // If there is a batch:
      let batch = null;
      if (batchID) {
        // Convert the script to a batch-based set of host scripts.
        const batchJSON = await fs.readFile(`${batchDir}/${batchID}.json`, 'utf8');
        batch = JSON.parse(batchJSON);
        const specs = batchify(script, batch, timeStamp);
        // Recursively run each host script and save the reports.
        await runHosts(timeStamp, specs);
      }
      // Otherwise, i.e. if there is no batch:
      else {
        // Run the script and save the result with a timestamp ID.
        await runHost(timeStamp, script);
        console.log(`Report ${timeStamp}.json in ${process.env.REPORTDIR}`);
      }
    }
    catch(error) {
      console.log(`ERROR running job (${error.message})\n${error.stack}`);
    }
  }
  else {
    console.log('ERROR: no script specified');
  }
};
