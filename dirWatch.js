/*
  dirWatch.js
  Module for launching a one-time directory watch.
*/

// ########## IMPORTS

// Module to spawn a child process.
const {spawn} = require('node:child_process');

// ########## CONSTANTS

const interval = 30;

// ########## FUNCTIONS

// Spawns a directory watch.
const spawnWatch = (command, args) => spawn(command, args, {stdio: ['inherit', 'inherit', 'pipe']});

// ########## OPERATION

const watcher = spawnWatch('node', ['call', 'watch', 'true', 'false', '20']);
let error = '';
watcher.stderr.on('data', data => {
  error += data.toString();
});
watcher.on('close', code => {
  if (error) {
    console.log(`ERROR: ${error.slice(0, 100)}`);
  }
  console.log(`Watcher exited with code ${code}`);
});
