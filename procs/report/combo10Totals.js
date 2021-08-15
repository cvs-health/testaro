/*
  combo10Totals.js
  Extracts the deficit totals from the reports of a combo10 or combo10Details batch.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Directories.
const fromDir = process.env.BATCHREPORTDIR;
const fromSubdir = process.argv[2];
const toSubdir = process.argv[3];
const fileID = process.argv[4];
const sortBy = process.argv[5] || 'deficit';
// Initialize the result.
const result = [];
// Populate it.
const fromFileNames = fs.readdirSync(`${fromDir}/${fromSubdir}`);
fromFileNames.forEach(fn => {
  const reportJSON = fs.readFileSync(`${fromDir}/${fromSubdir}/${fn}`, 'utf8');
  const report = JSON.parse(reportJSON);
  const summary = {
    org: report.acts[1].what,
    url: report.acts[1].result,
    deficit: report.acts[2].result.deficit.total
  };
  result.push(summary);
});
result.sort((a, b) => {
  if (a[sortBy] < b[sortBy]) {
    return -1;
  }
  else if (a[sortBy] > b[sortBy]) {
    return 1;
  }
  else {
    return 0;
  }
});
fs.writeFile(
  `${fromDir}/${toSubdir}/totals-${fileID}.json`, `${JSON.stringify(result, null, 2)}\n`
);
