/*
  © 2022–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  dirWatch.js
  Validator for directory watching.
*/

// IMPORTS

const fs = require('fs/promises');

// CONSTANTS

// Override dirWatch environment variables with validation-specific ones.
process.env.JOBDIR = `${__dirname}/../watch`;
process.env.REPORTDIR = `${__dirname}/../../temp`;
const jobID = '240101T1200-simple-example';
const {dirWatch} = require('../../dirWatch');

// Start checking for jobs every 5 seconds.
dirWatch(false, 5)
.then(() => {
  console.log('Success: Watch validation ended');
});
// Make a job available after 7 seconds.
setTimeout(() => {
  fs.copyFile(
    `${__dirname}/../jobs/todo/${jobID}.json`, `${process.env.JOBDIR}/todo/${jobID}.json`
  );
  console.log('Job made available after 7 seconds');
}, 7000);
