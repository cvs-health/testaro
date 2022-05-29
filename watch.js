/*
  watch.js
  Watches for jobs and runs them.
*/

// ########## IMPORTS

// Module to keep secrets local.
require('dotenv').config({override: true});
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
const exjobDir = process.env.EXJOBDIR;
const reportURL = process.env.REPORT_URL;
const reportDir = process.env.REPORTDIR;
const interval = process.env.INTERVAL;

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
    const request = client.request(jobURL, response => {
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
    request.end();
  });
  return job.jobID ? job : {};
};
// Writes a directory report.
const writeDirReport = async report => {
  const {id, jobID} = report;
  if (id && jobID) {
    const reportJSON = JSON.stringify(report, null, 2);
    await fs.writeFile(`${reportDir}/${report.id}.json`, reportJSON);
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
// Archives a job file.
const exifyJob = async (jobID, timeStamp) => {
  await fs.rename(`${jobDir}/${jobID}.json`, `${exjobDir}/${timeStamp}.json`);
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
const runHost = async (jobID, id, script) => {
  const report = {
    jobID,
    id,
    log: [],
    script,
    acts: []
  };
  await handleRequest(report);
  if (watchType === 'dir') {
    await writeDirReport(report);
  }
  else {
    await writeNetReport(report);
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
        // If there is a batch:
        if (batch) {
          // Convert the script to a batch-based set of scripts.
          const specs = batchify(script, batch, timeStamp);
          // For each script:
          while (specs.length) {
            // Run it and return the result with a host-suffixed timestamp ID.
            const spec = specs.shift();
            const {id} = spec;
            const hostScript = spec.script;
            return await runHost(jobID, id, hostScript);
          }
        }
        // Otherwise, i.e. if there is no batch:
        else {
          // Run the script and submit a report with a timestamp ID.
          return await runHost(jobID, timeStamp, script);
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
    console.log('ERROR: no job ID specified in job');
    return {
      error: 'ERROR: no job ID specified in job'
    };
  }
};
// Repeatedly checks for jobs, runs them, and submits reports.
const cycle = async () => {
  const interval = Number.parseInt(interval);
  while (true) {
    await wait(1000 * interval);
    const job = watchType === 'dir' ? await checkDirJob() : await checkNetJob();
    await runJob(job);
    await exifyJob(job.jobID, job.timeStamp);
  };
};

// ########## OPERATION

try {
  cycle();
}
catch(error) {
  console.log(`ERROR: ${error.message}`);
  const interval = Number.parseInt(INTERVAL);
  setTimeout(() => {
    cycle();
  }, interval)
}
