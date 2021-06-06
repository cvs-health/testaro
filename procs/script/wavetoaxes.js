/*
  wavetoaxes.js
  Converts a wave1 script to an axes script.
  This proc requires 2 arguments:
    0. the base of the name of the wave1 script file.
    1. The base of the name of the axes script file to be created.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// ########## CONSTANTS
// Base of the names of the files.
const inName = process.argv[2] || 'MISSING';
const outName = process.argv[3] || 'MISSING';
// Script directory
const scriptDir = process.env.SCRIPTDIR || 'MISSING';
// ########## OPERATION
fs.readFile(`${scriptDir}/${inName}.json`, 'utf8')
.then(waveJSON => {
  const waveScript = JSON.parse(waveJSON);
  const axesScript = {
    what: waveScript.what,
    acts: [waveScript.acts[0]]
  };
  waveScript.acts.slice(1).forEach(act => {
    axesScript.acts.push({
      type: 'url',
      which: act.which.url
    });
    axesScript.acts.push({
      type: 'axes',
      which: act.which.name
    });
  });
  fs.writeFile(`${scriptDir}/${outName}.json`, `${JSON.stringify(axesScript, null, 2)}\n`);
});
