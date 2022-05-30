/*
  watch.js
  Watches for jobs and runs them.
*/

// ########## IMPORTS

// Module to keep secrets local.
// require('dotenv').config({override: true});
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Module to make HTTP(S) requests.
const protocol = process.env.PROTOCOL;
const client = require(protocol);
// Module to perform tests.
const {handleRequest} = require('./run');
// Module to convert a script and a batch to a batch-based array of scripts.
const {batchify} = require('./batchify');

// ########## CONSTANTS

const watchType = process.env.WATCH_TYPE;
const jobURL = process.env.JOB_URL;
const authCode = process.env.AUTH_CODE;
const jobDir = process.env.JOBDIR;
const exJobDir = process.env.EXJOBDIR;
const reportURL = process.env.REPORT_URL;
const reportDir = process.env.REPORTDIR;
const interval = process.env.INTERVAL;
// Values of process.env properties are coerced to strings.
const watchForever = process.env.WATCH_FOREVER == 'true';

// ########## FUNCTIONS

// Checks for a directory job.
const checkDirJob = async () => {
  const jobDirFileNames = await fs.readdir(jobDir);
  const jobFileNames = jobDirFileNames.filter(fileName => fileName.endsWith('.json'));
  if (jobFileNames.length) {
    const firstJobID = jobFileNames[0].slice(0, -5);
    const jobJSON = await fs.readFile(`${jobDir}/${jobFileNames[0]}`, 'utf8');
    try {
      const job = JSON.parse(jobJSON, null, 2);
      job.jobID = firstJobID;
      return job;
    }
    catch(error) {
      return {
        error: 'ERROR: Job was not JSON',
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
  const job = await new Promise(resolve => {
    const wholeURL = `${jobURL}?authCode=${authCode}`;
    const request = client.request(wholeURL, response => {
      const chunks = [];
      response.on('data', chunk => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        try {
          const jobJSON = chunks.join('');
          const job = JSON.parse(jobJSON);
          // If a qualifying job was received:
          if (job.jobID) {
            // Return it.
            resolve(job);
          }
          // Otherwise, i.e. if there was no qualifying job:
          else {
            // Return this.
            resolve({});
          }
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
  return job;
};
// Writes a directory report.
const writeDirReport = async report => {
  const {id, jobID} = report;
  if (id && jobID) {
    const reportJSON = JSON.stringify(report, null, 2);
    try {
      await fs.writeFile(`${reportDir}/${report.id}.json`, reportJSON);
      return true;
    }
    catch(error) {
      console.log(`ERROR: Failed to write report ${id} for job ${jobID}`);
      return false;
    }
  }
};
// Submits a network report.
const writeNetReport = async report => {
  const ack = await new Promise(resolve => {
    const request = client.request(reportURL, {method: 'POST'}, response => {
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
  });
  return ack;
};
// Archives a job.
const exifyJob = async (job) => {
  const jobJSON = JSON.stringify(job, null, 2);
  await fs.writeFile(`${exJobDir}/${job.timeStamp}.json`, jobJSON);
  await fs.rm(`${jobDir}/${job.jobID}.json`);
};
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
// Runs one script and writes or sends a report.
const runHost = async (jobID, timeStamp, id, script) => {
  const report = {
    jobID,
    timeStamp,
    id,
    log: [],
    script,
    acts: []
  };
  await handleRequest(report);
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
};
// Runs a job and returns a report file for the script or each host.
const runJob = async job => {
  const {jobID, script, batch} = job;
  if (jobID) {
    if (script) {
      try {
        // Identify the start time and a timestamp.
        const timeStamp = Math.floor((Date.now() - Date.UTC(2022, 1)) / 2000).toString(36);
        job.timeStamp = timeStamp;
        // If there is a batch:
        if (batch) {
          // Convert the script to a set of host scripts.
          const specs = batchify(script, batch, timeStamp);
          // For each host script:
          let success = true;
          while (specs.length && success) {
            // Run it and return the result with a host-suffixed timestamp ID.
            const spec = specs.shift();
            const {id} = spec;
            const hostScript = spec.script;
            success = await runHost(jobID, timeStamp, id, hostScript);
          }
          return success;
        }
        // Otherwise, i.e. if there is no batch:
        else {
          // Run the script and submit a report with a timestamp ID.
          return await runHost(jobID, timeStamp, timeStamp, script);
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
      console.log('ERROR: no script specified');
      return {
        error: 'ERROR: no script specified'
      };
    }
  }
  else {
    console.log('ERROR: no job ID property in job');
    return {
      error: 'ERROR: no job ID property in job'
    };
  }
};
// Repeatedly checks for jobs, runs them, and submits reports.
const cycle = async forever => {
  const intervalMS = Number.parseInt(interval);
  let statusOK = true;
  let empty = false;
  console.log(`Watching started with intervals of ${interval} seconds when idle`);
  while (statusOK) {
    if (empty) {
      await wait(1000 * intervalMS);
    }
    // Check for a job.
    let job;
    if (watchType === 'dir') {
      job = await checkDirJob();
    }
    else if (watchType === 'net') {
      job = await checkNetJob();
    }
    else {
      job = {};
      console.log('ERROR: invalid WATCH_TYPE environment variable');
      statusOK = false;
    }
    // If there was one:
    if (job.jobID) {
      // Run it.
      console.log(`Running job ${job.jobID}`);
      statusOK = await runJob(job);
      console.log(`Job ${job.jobID} finished with time stamp ${job.timeStamp}`);
      if (statusOK) {
        await exifyJob(job);
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
