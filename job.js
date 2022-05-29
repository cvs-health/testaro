/*
  job.js
  Manages jobs.
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
const {handleRequest} = require('./run');

// ########## CONSTANTS
const scriptDir = process.env.SCRIPTDIR;
const batchDir = process.env.BATCHDIR;
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Converts a script to a batch-based array of scripts.
const batchify = (script, batch, timeStamp) => {
  const {hosts} = batch;
  const specs = hosts.map(host => {
    const newScript = JSON.parse(JSON.stringify(script));
    newScript.commands.forEach(command => {
      if (command.type === 'url') {
        command.which = host.which;
        command.what = host.what;
      }
    });
    const spec = {
      id: `${timeStamp}-${host.id}`,
      script: newScript
    };
    return spec;
  });
  return specs;
};
// Runs a no-batch script.
const runHost = async (id, script) => {
  const report = {
    id,
    log: [],
    script,
    acts: []
  };
  await handleRequest(report);
  const reportJSON = JSON.stringify(report, null, 2);
  await fs.writeFile(`${reportDir}/${id}.json`, reportJSON);
};
// Runs a job.
exports.job = async (scriptID, batchID) => {
  if (scriptID) {
    try {
      const scriptJSON = await fs.readFile(`${scriptDir}/${scriptID}.json`, 'utf8');
      const script = JSON.parse(scriptJSON);
      // Identify the start time and a timestamp.
      const timeStamp = Math.floor((Date.now() - Date.UTC(2022, 1)) / 2000).toString(36);
      // If there is a batch:
      let batch = null;
      if (batchID) {
        // Convert the script to a batch-based set of scripts.
        const batchJSON = await fs.readFile(`${batchDir}/${batchID}.json`, 'utf8');
        batch = JSON.parse(batchJSON);
        const specs = batchify(script, batch, timeStamp);
        // For each script:
        while (specs.length) {
          const spec = specs.shift();
          const {id, script} = spec;
          // Run it and save the result with a host-suffixed ID.
          await runHost(id, script);
        }
      }
      // Otherwise, i.e. if there is no batch:
      else {
        // Run the script and save the result with a timestamp ID.
        await runHost(timeStamp, script);
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

// ########## OPERATION

exports.job(process.argv[2], process.argv[3]);
