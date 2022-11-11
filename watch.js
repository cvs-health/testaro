/*
  watch.js
  Module for watching for a script and running it when found.
*/

// ########## IMPORTS

// Module to keep secrets local.
require('dotenv').config();
// Module to read and write files.
const fs = require('fs/promises');
// Module to perform tests.
const {doJob} = require('./run');

// ########## CONSTANTS

const protocol = process.env.PROTOCOL || 'https';
const client = require(protocol);
const jobURL = process.env.JOB_URL;
const agent = process.env.AGENT;
const jobDir = process.env.JOBDIR;
const doneDir = process.env.DONEDIR;
const reportURL = process.env.REPORT_URL;
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Checks for a directory job.
const checkDirJob = async () => {
  try {
    const jobDirFileNames = await fs.readdir(jobDir);
    const jobFileNames = jobDirFileNames.filter(fileName => fileName.endsWith('.json'));
    if (jobFileNames.length) {
      console.log('Directory job found');
      const scriptJSON = await fs.readFile(`${jobDir}/${jobFileNames[0]}`, 'utf8');
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
      console.log('Directory job not found');
      return {};
    }
  }
  catch {
    return {};
  }
};
// Checks for a network job.
const checkNetJob = async () => {
  const script = await new Promise(resolve => {
    const wholeURL = `${protocol}://${jobURL}?agent=${agent}`;
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
    request.on('error', error => {
      console.log(`ERROR checking for a network job (${error.message})`);
      resolve({});
    });
    request.end();
  });
  console.log(`Network job ${script.id ? '' : 'not '}found`);
  return script;
};
// Writes a directory report.
const writeDirReport = async report => {
  const jobID = report && report.job && report.job.id;
  if (jobID) {
    try {
      const reportJSON = JSON.stringify(report, null, 2);
      const reportName = `${jobID}.json`;
      await fs.writeFile(`${reportDir}/${reportName}`, reportJSON);
      console.log(`Report ${reportName} saved`);
      return true;
    }
    catch(error) {
      console.log(`ERROR: Failed to write report (${error.message})`);
      return false;
    }
  }
  else {
    console.log('ERROR: Job has no ID');
    return false;
  }
};
// Submits a network report.
const writeNetReport = async report => {
  const ack = await new Promise(resolve => {
    const wholeURL = `${process.env.PROTOCOL}://${reportURL}`;
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
    report.agent = agent;
    request.on('error', error => {
      console.log(`ERROR submitting job report (${error.message})`);
      resolve({});
    });
    request.write(JSON.stringify(report, null, 2));
    request.end();
    console.log(`Report ${report.job.id} submitted`);
  });
  return ack;
};
// Archives a job.
const archiveJob = async job => {
  const jobJSON = JSON.stringify(job, null, 2);
  await fs.writeFile(`${doneDir}/${job.id}.json`, jobJSON);
  await fs.rm(`${jobDir}/${job.id}.json`);
};
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
// Runs a job and returns a report.
exports.runJob = async (job, isDirWatch) => {
  const {id} = job;
  if (id) {
    try {
      // Initialize a report.
      const report = {
        job,
        acts: [],
        jobData: {}
      };
      // Run the job, adding to the report.
      await doJob(report);
      // If a directory was watched:
      if (isDirWatch) {
        // Save the report.
        return await writeDirReport(report);
      }
      // Otherwise, i.e. if the network was watched:
      else {
        // Send the report to the server.
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
exports.cycle = async (isDirWatch, isForever, interval) => {
  const intervalMS = 1000 * Number.parseInt(interval);
  let statusOK = true;
  // Prevent a wait before the first iteration.
  let empty = false;
  console.log(`Watching started with intervals of ${interval} seconds when idle`);
  while (statusOK) {
    if (empty) {
      await wait(intervalMS);
    }
    // Check for a job.
    let job;
    if (isDirWatch) {
      job = await checkDirJob();
    }
    else {
      job = await checkNetJob();
    }
    // If there was one:
    if (job.id) {
      // Run it and save a report.
      console.log(`Running job ${job.id}`);
      statusOK = await exports.runJob(job, isDirWatch);
      console.log(`Job ${job.id} finished`);
      if (statusOK) {
        // If a directory was watched:
        if (isDirWatch) {
          // Archive the job.
          await archiveJob(job);
          console.log(`Job ${job.id} archived`);
        }
        // If watching was specified for only 1 job, stop.
        statusOK = isForever;
        // Prevent a wait before the next iteration.
        empty = false;
      }
    }
    else {
      empty = true;
    }
  }
  console.log('Watching ended');
};
