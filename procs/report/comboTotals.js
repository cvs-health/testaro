/*
  comboTotals.js
  Extracts the deficit totals from the reports of a combo batch.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Directories.
const fromDir = process.env.BATCHREPORTDIR;
const fromSubdir = process.argv[2];
const toSubdir = process.argv[3];
const fileID = process.argv[4];
const withSubtotals = process.argv[5] === 'true';
const sortBy = process.argv[6] || 'deficit';
// Initialize the result.
const result = [];
// Populate it.
const fromFileNames = fs.readdirSync(`${fromDir}/${fromSubdir}`);
fromFileNames.forEach(fn => {
  const reportJSON = fs.readFileSync(`${fromDir}/${fromSubdir}/${fn}`, 'utf8');
  const report = JSON.parse(reportJSON);
  const deficits = report.acts[2].result.deficit;
  const summary = {
    fileName: fn,
    org: report.acts[1].what,
    url: report.acts[1].result,
    deficit: withSubtotals ? deficits : deficits.total
  };
  result.push(summary);
});
// Identifies the applicable sorter.
const sorter = item => {
  if (sortBy === 'deficit' && withSubtotals) {
    return item.deficit.total;
  }
  else {
    return item[sortBy];
  }
};
result.sort((a, b) => {
  if (sorter(a) < sorter(b)) {
    return -1;
  }
  else if (sorter(a) > sorter(b)) {
    return 1;
  }
  else {
    return 0;
  }
});
fs.writeFileSync(
  `${fromDir}/${toSubdir}/${fileID}.json`, `${JSON.stringify(result, null, 2)}\n`
);
