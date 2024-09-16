/*
  © 2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  test
  Performs the tests of a tool.
*/

// IMPORTS

const {launch} = require('../run');

// CONSTANTS

// Set DEBUG environment variable to 'true' to add debugging features.
const debug = process.env.DEBUG === 'true';
// Set WAITS environment variable to a positive number to insert delays (in ms).
const waits = Number.parseInt(process.env.WAITS) || 0;

// VARIABLES

let page;

const report = JSON.parse(process.argv[2]);
const actIndex = process.argv[3].toString();
const act = report.acts[actIndex];
const {which} = act;

const doAct = async () => {
  // Launch a browser, navigate to the URL, and create a page.
  await launch(
    report,
    debug,
    waits,
    act.launch.browserID || report.browserID,
    act.launch.target && act.launch.target.url || report.target.url
  );
  try {
    // If the page prevented the tool from testing:
    if (page.prevented) {
      // Report this.
      process.send('ERROR: Page prevented testing');
    }
    // Otherwise, i.e. if the page permits testing:
    else {
      // Perform the specified tests of the tool.
      const actReport = await require(`../tests/${which}`).reporter(page, report, actIndex, 65);
      // Add the data and result to the act.
      act.data = actReport.data;
      act.result = actReport.result;
      // If the tool reported that the page prevented testing:
      if (actReport.data.prevented) {
        // Add prevention data to the job data.
        report.jobData.preventions[which] = act.data.error;
      }
      // Send the revised report.
      process.send(report);
    }
  }
  // If the tool invocation failed:
  catch(error) {
    // Report the failure.
    const message = error.message.slice(0, 400);
    console.log(`ERROR: Test act ${act.which} failed (${message})`);
    process.send('ERROR performing the act');
  };
};
