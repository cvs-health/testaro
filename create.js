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

// ########## FUNCTIONS

// Runs one script and writes a report file.
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
// Runs a file-based job and writes a report file for the script or each host.
exports.runJob = async (scriptID, batchID) => {
  if (scriptID) {
    try {
      const scriptJSON = await fs.readFile(`${scriptDir}/${scriptID}.json`, 'utf8');
      const script = JSON.parse(scriptJSON);
      // Identify the start time and a timestamp.
      const timeStamp = Math.floor((Date.now() - Date.UTC(2022, 1)) / 2000).toString(36);
      // If there is a batch:
      let batch = null;
      if (batchID) {
        // Convert the script to a batch-based set of host scripts.
        const batchJSON = await fs.readFile(`${batchDir}/${batchID}.json`, 'utf8');
        batch = JSON.parse(batchJSON);
        const specs = batchify(script, batch, timeStamp);
        // Recursively run each host script and save a report.
        const runHosts = specs => {
          if (specs.length) {
            // Run the first one and save the report with a host-suffixed ID.
            const spec = specs.shift();
            const {id, timeLimit, host, script} = spec;
            const subprocess = fork(
              'runHost', [id, JSON.stringify(script), JSON.stringify(host)],
              {
                detached: true
              }
            );
            subprocess.unref();
            const startTime = Date.now();
            const reportNameEnd = `-${host.id}.json`;
            // At 5-second intervals:
            const reCheck = setInterval(async () => {
              // If the time limit has been reached or the report has been written:
              const reportNames = await fs.readdir(reportDir);
              if (
                Date.now() - startTime > 1000 * timeLimit
                || reportNames.find(fileName => fileName.endsWith(reportNameEnd))
              ) {
                // Stop checking.
                clearInterval(reCheck);
                // Run the next host script.
                runHosts(specs);
              }
            }, 5000);
          }
        };
      }
      // Otherwise, i.e. if there is no batch:
      else {
        // Run the script and save the result with a timestamp ID.
        await runHost(timeStamp, script);
      }
      return timeStamp;
    }
    catch(error) {
      console.log(`ERROR: ${error.message}\n${error.stack}`);
      return null;
    }
  }
  else {
    console.log('ERROR: no script specified');
    return null;
  }
};
