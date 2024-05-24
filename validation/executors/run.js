/*
  © 2022–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  run.js
  Validator for immediate job execution.
*/

// ########## IMPORTS

const fs = require('fs/promises');

// ########## CONSTANTS

const {doJob} = require('../../run');
const jobID = '240101T1200-simple-example';

// ########## OPERATION

// Get the simple job.
fs.readFile(`${__dirname}/../jobs/todo/${jobID}.json`, 'utf8')
.then(async jobJSON => {
  const report = JSON.parse(jobJSON);
  // Run it.
  await doJob(report);
  try {
    // Check the report against expectations.
    const {acts, jobData} = report;
    if (acts.length !== 2) {
      console.log('Failure: Count of acts is not 2');
    }
    else if (! jobData) {
      console.log('Failure: Report omits jobData');
    }
    else if (jobData.endTime < jobData.startTime) {
      console.log('Failure: End time precedes start time');
    }
    else {
      console.log('Success');
    }
  }
  catch(error) {
    console.log(`ERROR: ${error.message}`);
  }
});
