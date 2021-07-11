/*
  orgURLFix.js
  Corrects a KickFire organization file by replacing URLs with resulting URLs from a report.
  This proc requires 3 arguments:
    0. the base of the name of the input KickFire file.
    1. the base of the name of the output KickFire file.
    2. the base of the name of the report file.
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
const reportName = process.argv[4] || 'MISSING';
// Directory of data.
const dataDir = process.env.DATADIR || 'MISSING';
// ########## OPERATION
fs.readFile(`${dataDir}/${inName}.json`, 'utf8')
.then(inJSON => {
  const data = JSON.parse(inJSON);
  fs.readFile(`${dataDir}../reports/script/${reportName}.json`, 'utf8')
  .then(reportJSON => {
    const reportActs = JSON.parse(reportJSON).acts.filter(act => act.result !== 'ERROR');
    const converter = {};
    reportActs.forEach(act => {
      converter[act.which] = act.result;
    });
    data.forEach(orgViews => {
      orgViews.forEach(orgView => {
        const url = converter[orgView.website];
        if (url) {
          orgView.url = url;
        }
      });
      orgViews = orgViews.filter(orgView => orgView.url);
    });
    fs.writeFile(`${dataDir}/${outName}.json`, `${JSON.stringify(data, null, 2)}\n`);
  });
});
