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
const watchDir = process.env.WATCHDIR;
const doneDir = process.env.DONEDIR;
const reportURL = process.env.REPORT_URL;
const reportDir = process.env.REPORTDIR;

// ########## FUNCTIONS

// Checks for a directory job.
const checkDirJob = async () => {
  try {
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
      const reportName = `${scriptID}.json`;
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
    const wholeURL = `${process.env.PROTOCOL}://${reportURL}?agent=${agent}`;
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
    console.log(`Report ${report.script.id} submitted`);
  });
  return ack;
};
// Archives a job.
const archiveJob = async script => {
  const scriptJSON = JSON.stringify(script, null, 2);
  await fs.writeFile(`${doneDir}/${script.id}.json`, scriptJSON);
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
// Runs a job and returns a report.
exports.runJob = async (script, isDirWatch) => {
  const {id} = script;
  if (id) {
    try {
      // Initialize a report.
      const report = {
        log: [],
        script,
        acts: []
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
    let script;
    if (isDirWatch) {
      script = await checkDirJob();
    }
    else {
      script = await checkNetJob();
    }
    // If there was one:
    if (script.id) {
      // Run it and save a report.
      console.log(`Running script ${script.id}`);
      statusOK = await exports.runJob(script, isDirWatch);
      console.log(`Job ${script.id} finished`);
      if (statusOK) {
        // If a directory was watched:
        if (isDirWatch) {
          // Archive the script.
          await archiveJob(script);
          console.log(`Script ${script.id} archived`);
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
