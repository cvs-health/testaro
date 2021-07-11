/*
  orgURL.js
  Converts a file of KickFire organization data to a url script.
  This proc requires 2 or 3 arguments:
    0. the base of the name of the file of data.
    1. the base of the name of the script file to be created.
    2. if there is no DATADIR entry in the .env file, the path of the directory of the file of data.
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
fs.readFile(`${dataDir}/${inName}.json`, 'utf8')
.then(kickFireJSON => {
  const kickFireData = JSON.parse(kickFireJSON);
  const urlScript = {
    what: 'url acts of organization webpages',
    acts: [{
      type: 'launch',
      which: 'chromium'
    }]
  };
  kickFireData.forEach(orgViews => {
    if (Array.isArray(orgViews)) {
      orgViews.forEach(orgView => {
        urlScript.acts.push({
          type: 'url',
          which: `https://${orgView.website}`
        });
      });
    }
  });
  fs.writeFile(`${scriptDir}/${outName}.json`, `${JSON.stringify(urlScript, null, 2)}\n`);
});
