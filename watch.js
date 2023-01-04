/*
  watch.js
  Module for watching for a job and running it when found.
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
const reportURL = process.env.REPORT_URL;
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Checks for a directory job.
const checkDirJob = async () => {
  try {
    const toDoDirFileNames = await fs.readdir(`${jobDir}/todo`);
    const jobFileNames = toDoDirFileNames.filter(fileName => fileName.endsWith('.json'));
    if (jobFileNames.length) {
      console.log('Directory job found');
      const jobJSON = await fs.readFile(`${jobDir}/todo/${jobFileNames[0]}`, 'utf8');
      try {
        const job = JSON.parse(jobJSON, null, 2);
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
  const job = await new Promise(resolve => {
    const wholeURL = `${protocol}://${jobURL}?agent=${agent}`;
    const request = client.request(wholeURL, response => {
      const chunks = [];
      response.on('data', chunk => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        try {
          const jobJSON = chunks.join('');
          const job = JSON.parse(jobJSON);
          // Return it.
          resolve(job);
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
  console.log(`Network job ${job.id || 'not'} received`);
  return job;
};
// Writes a directory report.
const writeDirReport = async report => {
  const jobID = report && report.id;
  if (jobID) {
    try {
      const reportJSON = JSON.stringify(report, null, 2);
      const reportName = `${jobID}.json`;
      const rawDir = `${reportDir}/raw`;
      await fs.writeFile(`${rawDir}/${reportName}`, reportJSON);
      console.log(`Report ${reportName} saved in ${rawDir}`);
    }
    catch(error) {
      console.log(`ERROR: Failed to write report (${error.message})`);
    }
  }
  else {
    console.log('ERROR: Job has no ID');
  }
};
// Submits a network report to a server and returns the server response.
const writeNetReport = async report => {
  const ack = await new Promise(resolve => {
    const wholeURL = `${process.env.PROTOCOL}://${reportURL}`;
    const request = client.request(wholeURL, {method: 'POST'}, response => {
      const chunks = [];
      response.on('data', chunk => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        const content = chunks.join('');
        try {
          resolve(JSON.parse(content));
        }
        catch(error) {
          resolve({
            error: 'ERROR: Response was not JSON',
            message: error.message,
            status: response.statusCode,
            content: content.slice(0, 200)
          });
        }
      });
    });
    report.agent = agent;
    request.on('error', error => {
      console.log(`ERROR submitting job report (${error.message})`);
      resolve({
        error: 'ERROR: Job report submission failed',
        message: error.message
      });
    });
    // Send the report to the server.
    request.write(JSON.stringify(report, null, 2));
    request.end();
    console.log(`Report ${report.job.id} submitted`);
  });
  // Return the server response.
  return ack;
};
// Archives a job.
const archiveJob = async job => {
  const jobJSON = JSON.stringify(job, null, 2);
  await fs.writeFile(`${jobDir}/done/${job.id}.json`, jobJSON);
  await fs.rm(`${jobDir}/todo/${job.id}.json`);
};
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
// Runs a job.
const runJob = async (job, isDirWatch) => {
  // If the job has an ID:
  const {id} = job;
  if (id) {
    try {
      // Run the job, adding to the report.
      await doJob(job);
      // If a directory was watched:
      if (isDirWatch) {
        // Save the report.
        await writeDirReport(job);
      }
      // Otherwise, i.e. if the network was watched:
      else {
        // Send the report to the server.
        const ack = await writeNetReport(job);
        if (ack.error) {
          console.log(JSON.stringify(ack, null, 2));
        }
      }
    }
    // If the job failed:
    catch(error) {
      // Report this.
      console.log(`ERROR: ${error.message}\n${error.stack}`);
    }
  }
  // Otherwise, i.e. if the job has no ID:
  else {
    // Report this.
    console.log('ERROR: Job has no id');
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
      await runJob(JSON.parse(JSON.stringify(job)), isDirWatch);
      console.log(`Job ${job.id} finished`);
      // If a directory was watched:
      if (isDirWatch) {
        // Archive the job.
        await archiveJob(job);
        console.log(`Job ${job.id} archived`);
      }
      // If watching was specified for only 1 job, quit.
      statusOK = isForever;
      // Prevent a wait before the next iteration.
      empty = false;
    }
    // Otherwise, i.e. if no job was found:
    else {
      // Cause a wait before the next check.
      empty = true;
    }
  }
  console.log('Watching ended');
};
