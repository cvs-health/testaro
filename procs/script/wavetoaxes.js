/*
  wavetoaxes.js
  Converts a waves script to an axes script.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// ########## OPERATION
const prefix = process.argv[2];
fs.readFile(`doc/scripts/${prefix}wave.json`, 'utf8')
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
  fs.writeFile(`doc/scripts/${prefix}axes.json`, `${JSON.stringify(axesScript, null, 2)}\n`);
});
