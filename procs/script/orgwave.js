/*
  orgwave.js
  Converts a file of organization names and URLs to a waves script.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// ########## OPERATION
fs.readFile('orgurls.json', 'utf8')
.then(kickFireJSON => {
  const kickFireData = JSON.parse(kickFireJSON);
  const wavesScript = {
    what: 'WAVE tests of organization webpages',
    acts: [{
      type: 'launch',
      which: 'chromium'
    }]
  };
  const kickFireBests = kickFireData.map(org => org.filter(url => url.index === 0)[0]);
  kickFireBests.forEach(org => {
    wavesScript.acts.push({
      type: 'waves',
      which: {
        url: `https://${org.website}`,
        name: org.orgName
      }
    });
  });
  fs.writeFile('doc/scripts/orgwave.json', `${JSON.stringify(wavesScript, null, 2)}\n`);
});
