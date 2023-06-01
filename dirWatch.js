/*
  dirWatch.js
  Module for launching a repeated one-time directory watch.
*/

// ########## IMPORTS

// Module to spawn a child process.
const {spawn} = require('node:child_process');

// ########## CONSTANTS

const interval = process.argv[2];

// ########## FUNCTIONS

// Spawns a one-time directory watch.
const spawnWatch = (command, args) => spawn(command, args, {stdio: ['inherit', 'inherit', 'pipe']});
// Repeatedly spawns a one-time directory watch.
const reWatch = () => {
  const watcher = spawnWatch('node', ['call', 'watch', 'true', 'false', interval]);
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
        console.log(`ERROR: ${error.slice(0, 200)}`);
      }
    }
    if (code === 0) {
      console.log('Watcher exited successfully');
    }
    else {
      console.log(`Watcher exited with error code ${code}`);
    }
    reWatch();
  });
};

// ########## OPERATION

reWatch();
