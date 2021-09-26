/*
  scoreAgg.js
  Extracts the deficit totals from the reports of a batch.
  Arguments:
    0. Subdirectory of report directory.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Directory.
const dir = `${process.env.REPORTDIR}/${process.argv[2]}`;
// Initialize the result.
const result = [];
// Populate it.
const fileNames = fs.readdirSync(`${dir}/reports`);
let batchData = {};
fileNames.forEach((fn, index) => {
  const reportJSON = fs.readFileSync(`${dir}/reports/${fn}`, 'utf8');
  const report = JSON.parse(reportJSON);
  const orgData = report.acts.filter(act => act.type === 'url')[0];
  const deficitData = report.acts.filter(act => act.type === 'score')[0];
  if (index === 0) {
    batchData.proc = deficitData.which;
    batchData.description = deficitData.what;
  }
  const summary = {
    fileName: fn,
    org: orgData.what,
    url: orgData.which,
    deficits: deficitData.result
  };
  result.push(summary);
});
result.sort((a, b) => a.deficits.total - b.deficits.total);
const data = {
  batchData,
  result
};
fs.writeFileSync(
  `${dir}/deficits.json`, `${JSON.stringify(data, null, 2)}\n`
);
