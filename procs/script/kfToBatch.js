/*
  kfToBatch.js
  Converts a KickFire file (named “orgurls.json” in the data directory) data to a batch.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// Module to keep secrets local.
require('dotenv').config();
// ########## CONSTANTS
// Directory of data.
const dataDir = process.env.DATADIR;
// ########## OPERATION
fs.readFile(`${dataDir}/orgurls.json`, 'utf8')
.then(kickFireJSON => {
  const kickFireData = JSON.parse(kickFireJSON);
  const batch = {
    what: 'replace this with description of batch',
    hosts: []
  };
  kickFireData.forEach(orgViews => {
    if (Array.isArray(orgViews)) {
      orgViews.forEach(orgView => {
        batch.hosts.push({
          which: `https://${orgView.website}`,
          what: orgView.tradeName
        });
      });
    }
  });
  fs.writeFile(`${dataDir}/batch.json`, `${JSON.stringify(batch, null, 2)}\n`);
});
