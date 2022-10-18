/*
  watch.js
  Watches for a script and runs it.
  Arguments:
    0. Watch type: 'dir' or 'net'.
    1. How long to watch: 'once' or 'forever'.
    2. How often to check in seconds.
  Usage example: node watch dir once 15
*/

// ########## IMPORTS

// Module to keep secrets local.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Module to perform tests.
const {doJob} = require('./run');

// ########## CONSTANTS

const watchType = process.argv[2];
const watchForever = process.argv[3] === 'forever';
const interval = Number.parseInt(process.argv[4]);
let client;
if (watchType === 'net') {
  client = require(process.env.PROTOCOL || 'https');
}
const jobURL = process.env.JOB_URL;
const worker = process.env.WORKER;
const watchDir = process.env.WATCHDIR;
const doneDir = process.env.DONEDIR;
const reportURL = process.env.REPORT_URL;
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Checks for a directory job.
const checkDirJob = async () => {
  const jobDirFileNames = await fs.readdir(watchDir);
  const jobFileNames = jobDirFileNames.filter(fileName => fileName.endsWith('.json'));
  if (jobFileNames.length) {
    const scriptJSON = await fs.readFile(`${watchDir}/${jobFileNames[0]}`, 'utf8');
    try {
      const script = JSON.parse(scriptJSON, null, 2);
      return script;
    }
    catch(error) {
      return {
        error: 'ERROR: Script was not JSON',
        message: error.message
      };
    }
  }
  else {
    return {};
  }
};
// Checks for a network job.
const checkNetJob = async () => {
  const script = await new Promise(resolve => {
    const wholeURL = `${process.env.PROTOCOL}://${jobURL}?worker=${worker}`;
    const request = client.request(wholeURL, response => {
      const chunks = [];
      response.on('data', chunk => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        try {
          const scriptJSON = chunks.join('');
          const script = JSON.parse(scriptJSON);
          // Return it.
          resolve(script);
        }
        catch(error) {
          resolve({
            error: 'ERROR: Response was not JSON',
            message: error.message,
            status: response.statusCode
          });
        }
      });
    });
    request.end();
  });
  return script;
};
// Writes a directory report.
const writeDirReport = async report => {
  const scriptID = report && report.script && report.script.id;
  if (scriptID) {
    try {
      const reportJSON = JSON.stringify(report, null, 2);
      const reportName = `${reportDir}/${report.timeStamp}-${scriptID}.json`;
      await fs.writeFile(`${reportDir}/${reportName}`, reportJSON);
      console.log(`Report ${reportName} saved`);
      return true;
    }
    catch(error) {
      console.log(`ERROR: Failed to write report (${error.message})`);
      return false;
    }
  }
};
// Submits a network report.
const writeNetReport = async report => {
  const ack = await new Promise(resolve => {
    const wholeURL = `${process.env.PROTOCOL}://${reportURL}?worker=${worker}`;
    const request = client.request(wholeURL, {method: 'POST'}, response => {
      const chunks = [];
      response.on('data', chunk => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(chunks.join('')));
        }
        catch(error) {
          resolve({
            error: 'ERROR: Response was not JSON',
            message: error.message,
            status: response.statusCode
          });
        }
      });
    });
    request.write(JSON.stringify(report, null, 2));
    request.end();
    console.log(`Report ${report.timeStamp}-${report.script.id} submitted`);
  });
  return ack;
};
// Archives a job.
const archiveJob = async script => {
  const jobJSON = JSON.stringify(script, null, 2);
  await fs.writeFile(`${doneDir}/${script.id}.json`, jobJSON);
  await fs.rm(`${watchDir}/${script.id}.json`);
};
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
// Runs a script, time-stamps it, and returns a report.
const runJob = async script => {
  const {id} = script;
  if (id) {
    try {
      // Identify the start time and a time stamp.
      const timeStamp = Math.floor((Date.now() - Date.UTC(2022, 1)) / 2000).toString(36);
      script.timeStamp = timeStamp;
      // Initialize a report.
      const report = {
        log: [],
        script,
        acts: []
      };
      await doJob(report);
      if (watchType === 'dir') {
        return await writeDirReport(report);
      }
      else {
        const ack = await writeNetReport(report);
        if (ack.error) {
          console.log(JSON.stringify(ack, null, 2));
          return false;
        }
        else {
          return true;
        }
      }
    }
    catch(error) {
      console.log(`ERROR: ${error.message}\n${error.stack}`);
      return {
        error: `ERROR: ${error.message}\n${error.stack}`
      };
    }
  }
  else {
    console.log('ERROR: script has no id');
    return {
      error: 'ERROR: script has no id'
    };
  }
};
// Checks for a job, performs it, and submits a report, once or repeatedly.
const cycle = async forever => {
  const intervalMS = 1000 * Number.parseInt(interval);
  let statusOK = true;
  let empty = false;
  console.log(`Watching started with intervals of ${interval} seconds when idle`);
  while (statusOK) {
    if (empty) {
      await wait(intervalMS);
    }
    // Check for a job.
    let script;
    if (watchType === 'dir') {
      script = await checkDirJob();
    }
    else if (watchType === 'net') {
      script = await checkNetJob();
    }
    else {
      script = {};
      console.log('ERROR: invalid WATCH_TYPE environment variable');
      statusOK = false;
    }
    // If there was one:
    if (script.id) {
      // Run it, add a timestamp to it, and save a report.
      console.log(`Running script ${script.id}`);
      statusOK = await runJob(script);
      console.log(`Job ${script.id} finished with time stamp ${script.timeStamp}`);
      if (statusOK) {
        // If the script was in a directory:
        if (watchType === 'dir') {
          // Archive the script.
          await archiveJob(script);
          console.log(`Script ${script.id}.json archived as ${script.timeStamp}-${script.id}.json`);
        }
        // If watching was specified for only 1 job, stop.
        statusOK = forever;
      }
    }
    else {
      empty = true;
    }
  }
  console.log('Watching ended');
};

// ########## OPERATION

// Start watching, as specified, either forever or until 1 job is run.
cycle(watchForever);
