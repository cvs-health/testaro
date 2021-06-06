/*
  urlwave.js
  Converts a text file of names and URLs, @-delimited, to a wave1 script.
  This proc requires 2 or 3 arguments:
    0. the base of the name of the file of data.
    1. The base of the name of the script file to be created.
    2. If there is no DATADIR entry in the .env file, the path of the directory of the file of data.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// Module to keep secrets local.
require('dotenv').config();
// ########## CONSTANTS
// Base of the names of the files.
const inName = process.argv[2] || 'MISSING';
const outName = process.argv[3] || 'MISSING';
// Directory of data.
const dataDir = process.env.DATADIR || process.argv[4] || 'MISSING';
// Script directory
const scriptDir = process.env.SCRIPTDIR || 'MISSING';
// ########## OPERATION
fs.readFile(`${dataDir}/${inName}.txt`, 'utf8')
.then(content => {
  const commands = content
  .split('\n')
  .filter(line => line.includes('@'))
  .map(urlLine => {
    const pair = urlLine.split('@', 2);
    return pair[1].length ? {
      type: 'wave1',
      which: pair[1],
      what: pair[0]
    } : '';
  })
  .filter(command => typeof command === 'object');
  const wave1Script = {
    what: 'WAVE tests of organization webpages',
    acts: [{
      type: 'launch',
      which: 'chromium'
    }].concat(commands)
  };
  fs.writeFile(`${scriptDir}/${outName}.json`, `${JSON.stringify(wave1Script, null, 2)}\n`);
});
