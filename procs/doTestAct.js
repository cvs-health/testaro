/*
  © 2024–2025 CVS Health and/or one of its affiliates. All rights reserved.

  MIT License

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  doTestAct
  Performs the tests of an act.
*/

// IMPORTS

// Module to perform file operations.
const fs = require('fs/promises');
const {launch} = require(`${__dirname}/../run`);
// Module to set operating-system constants.
const os = require('os');

// CONSTANTS

// Set DEBUG environment variable to 'true' to add debugging features.
const debug = process.env.DEBUG === 'true';
// Set WAITS environment variable to a positive number to insert delays (in ms).
const waits = Number.parseInt(process.env.WAITS) || 0;
const tmpDir = os.tmpdir();

// VARIABLES

const actIndex = Number.parseInt(process.argv[2]);

// FUNCTIONS

const doTestAct = async () => {
  const reportPath = `${tmpDir}/report.json`;
  // Get the saved report.
  const reportJSON = await fs.readFile(reportPath, 'utf8');
  const report = JSON.parse(reportJSON);
  // Get the act.
  const act = report.acts[actIndex];
  // Get the tool name.
  const {which} = act;
  // Launch a browser, navigate to the URL, and redefine the page export of the run module.
  await launch(
    report,
    debug,
    waits,
    act.launch && act.launch.browserID || report.browserID,
    act.launch && act.launch.target && act.launch.target.url || report.target.url
  );
  // If the launch aborted the job:
  if (report.jobData && report.jobData.aborted) {
    // Save the revised report.
    const reportJSON = JSON.stringify(report);
    await fs.writeFile(reportPath, reportJSON);
    // Report this.
    process.send('ERROR: Job aborted');
  }
  // Otherwise, i.e. if the launch did not abort the job:
  else {
    // Get the redefined page.
    const {page} = require('../run');
    // If it exists:
    if (page) {
      try {
        // If the page prevents the tool from testing:
        if (page.prevented) {
          // Report this.
          process.send('ERROR: Page prevented testing');
        }
        // Otherwise, i.e. if the page permits testing:
        else {
          // Wait for the act reporter to perform the specified tests of the tool.
          const actReport = await require(`../tests/${which}`).reporter(page, report, actIndex, 65);
          // Add the data and result to the act.
          act.data = actReport.data;
          act.result = actReport.result;
          // If the tool reported that the page prevented testing:
          if (actReport.data && actReport.data.prevented) {
            // Add prevention data to the job data.
            report.jobData.preventions[which] = act.data.error;
          }
          const reportJSON = JSON.stringify(report);
          // Save the revised report.
          await fs.writeFile(reportPath, reportJSON);
          // Send a completion message.
          process.send('Act completed');
        }
      }
      // If the tool invocation failed:
      catch(error) {
        // Save the revised report.
        const reportJSON = JSON.stringify(report);
        await fs.writeFile(reportPath, reportJSON);
        // Report the failure.
        const message = error.message.slice(0, 400);
        console.log(`ERROR: Test act ${act.which} failed (${message})`);
        process.send('ERROR performing the act');
      };
    }
    // Otherwise, i.e. if the page does not exist:
    else {
      // Report this.
      process.send('ERROR: No page');
    }
  }
};

doTestAct();
