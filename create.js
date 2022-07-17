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
  let healthy = true;
  let childAlive = true;
  process.on('SIGINT', () => {
    console.log('ERROR: Terminal interrupted runJob');
    healthy = false;
  });
  if (scriptID) {
    try {
      const scriptJSON = await fs.readFile(`${scriptDir}/${scriptID}.json`, 'utf8');
      const script = JSON.parse(scriptJSON);
      // Get the time limit of the script or, if none, set it to 5 minutes.
      let {timeLimit} = script;
      timeLimit = timeLimit || 300;
      // Identify the start time and a timestamp.
      const timeStamp = Math.floor((Date.now() - Date.UTC(2022, 1)) / 2000).toString(36);
      // If there is a batch:
      let batch = null;
      if (batchID) {
        // Convert the script to a batch-based set of host scripts.
        const batchJSON = await fs.readFile(`${batchDir}/${batchID}.json`, 'utf8');
        batch = JSON.parse(batchJSON);
        const specs = batchify(script, batch, timeStamp);
        const batchSize = specs.length;
        const sizedRep = `${batchSize} report${batchSize > 1 ? 's' : ''}`;
        const timeoutHosts = [];
        const crashHosts = [];
        // FUNCTION DEFINITION START
        // Recursively runs host scripts.
        const runHosts = specs => {
          // If any scripts remain to be run and the process has not been interrupted:
          if (specs.length && healthy) {
            childAlive = true;
            // Run the first one and save the report with a host-suffixed ID.
            const spec = specs.shift();
            const {id, host, script} = spec;
            const subprocess = fork(
              'runHost', [id, JSON.stringify(script), JSON.stringify(host)],
              {
                detached: true,
                stdio: [0, 1, 'ignore', 'ipc']
              }
            );
            subprocess.on('exit', () => {
              childAlive = false;
            });
            const startTime = Date.now();
            // At 5-second intervals:
            const reCheck = setInterval(async () => {
              // If the user has not interrupted the process:
              if (healthy) {
                // If there is no need to keep checking:
                const reportNames = await fs.readdir(reportDir);
                const timedOut = Date.now() - startTime > 1000 * timeLimit;
                const reportWritten = reportNames.includes(`${id}.json`);
                if (timedOut || reportWritten || ! childAlive) {
                  // Stop checking.
                  clearInterval(reCheck);
                  // If the cause is a timeout:
                  if (timedOut) {
                    // Add the host to the array of timed-out hosts.
                    timeoutHosts.push(id);
                  }
                  // Otherwise, if the cause is a child crash:
                  else if (! (childAlive || reportWritten)) {
                    // Add the host to the array of crashed hosts.
                    crashHosts.push(id);
                  }
                  // Run the script of the next host.
                  runHosts(specs);
                }
              }
              // Otherwise, i.e. if the user has interrupted the process:
              else {
                // Tell the script run to quit.
                subprocess.send('interrupt');
                // Stop checking.
                clearInterval(reCheck);
              }
            }, 5000);
          }
          else {
            console.log(`${sizedRep} ${timeStamp}-....json in ${process.env.REPORTDIR}`);
            if (timeoutHosts.length) {
              console.log(`Reports not created:\n${JSON.stringify(timeoutHosts), null, 2}`);
            }
            if (crashHosts.length) {
              console.log(
                `Hosts crashed with or without report:\n${JSON.stringify(crashHosts, null, 2)}`
              );
            }
          }
        };
        // FUNCTION DEFINITION END
        // Recursively run each host script and save the reports.
        runHosts(specs);
      }
      // Otherwise, i.e. if there is no batch:
      else {
        // Run the script and save the result with a timestamp ID.
        await runHost(timeStamp, script);
        console.log(`Report ${timeStamp}.json in ${process.env.REPORTDIR}`);
      }
    }
    catch(error) {
      console.log(`ERROR: ${error.message}\n${error.stack}`);
    }
  }
  else {
    console.log('ERROR: no script specified');
  }
};
