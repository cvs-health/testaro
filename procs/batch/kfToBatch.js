/*
  kfToBatch.js
  Converts a KickFire file to a batch file.
  Arguments:
    0. Filename base.
    1. Description.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Directory.
const dir = process.env.BATCHDIR;
const fileName = process.argv[2];
// Source.
const kfDataJSON = fs.readFileSync(`${dir}/${fileName}-kf.json`, 'utf8');
const kfData = JSON.parse(kfDataJSON);
// Initialize the result.
const result = {
  what: process.argv[3],
  hosts: []
};
// Populate it.
kfData.forEach(items => {
  if (Array.isArray(items)) {
    items.forEach(item => {
      result.hosts.push({
        which: item.url,
        what: item.tradeName
      });
    });
  }
});
result.hosts.sort((a, b) => {
  if (a.what < b.what) {
    return -1;
  }
  else if (a.what > b.what) {
    return 1;
  }
  else {
    return 0;
  }
});
fs.writeFileSync(
  `${dir}/${fileName}.json`, `${JSON.stringify(result, null, 2)}\n`
);
