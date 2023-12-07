/*
  © 2023 CVS Health and/or one of its affiliates. All rights reserved.

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
  Module for launching a one-time directory watch.
  Argument:
    1: interval in seconds from a no-job check to the next check.
*/

// ########## IMPORTS

// Module to spawn a child process.
const {spawn} = require('node:child_process');

// ########## CONSTANTS

const repeat = process.argv[2];
const interval = process.argv[3];

// ########## FUNCTIONS

// Spawns a one-time directory watch.
const spawnWatch = () => spawn(
  'node', 'dirWatch', 'false', interval, {stdio: ['inherit', 'inherit', 'pipe']}
);
// Repeatedly spawns a one-time directory watch.
const reWatch = () => {
  const watcher = spawnWatch('node', ['call', 'dirWatch', 'false', interval]);
  let error = '';
  watcher.stderr.on('data', data => {
    error += data.toString();
  });
  watcher.on('close', async code => {
    if (error) {
      if (error.startsWith('Navigation timeout of 30000 ms exceeded')) {
        console.log('ERROR: Playwright claims 30-second timeout exceeded');
      }
      else {
        console.log(`ERROR watching: ${error.slice(0, 200)}`);
      }
    }
    if (! error && code === 0) {
      console.log('Watcher exited successfully\n');
      reWatch();
    }
    else if (code) {
      console.log(`Watcher exited with error code ${code}`);
    }
    else {
      console.log('Watch aborted');
    }
  });
};

// ########## OPERATION

reWatch();
