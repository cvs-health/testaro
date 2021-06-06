/*
  orgwave.js
  Converts a file of KickFire organization data to a wave1 script.
  This proc requires 2 or 3 arguments:
    0. the base of the name of the file of data.
    1. The base of the name of the script file to be created.
    2. If there is no DATADIR entry in the .env file, the path of the directory of the file of data.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
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
  const wave1Script = {
    what: 'WAVE tests of organization webpages',
    acts: [{
      type: 'launch',
      which: 'chromium'
    }]
  };
  const kickFireBests = kickFireData.map(org => org.filter(url => url.index === 0)[0]);
  kickFireBests.forEach(org => {
    wave1Script.acts.push({
      type: 'wave1',
      which: {
        url: `https://${org.website}`,
        name: org.orgName
      }
    });
  });
  fs.writeFile(`${scriptDir}/${outName}.json`, `${JSON.stringify(wave1Script, null, 2)}\n`);
});
