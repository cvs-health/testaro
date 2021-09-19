/*
  bulkAgg.js
  Extracts the bulk test results from the reports of a batch.
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
  const bulkData = report.acts.filter(act => act.which === 'bulk')[0];
  if (index === 0) {
    batchData.proc = bulkData.which;
    batchData.description = bulkData.what;
  }
  const testTime = report.testTimes[0];
  const summary = {
    fileName: fn,
    org: orgData.what,
    url: orgData.result,
    bulk: bulkData.result.visibleElements,
    latency: testTime ? testTime[1] : 'NULL'
  };
  result.push(summary);
});
result.sort((a, b) => {
  const aLC = a.org.toLowerCase();
  const bLC = b.org.toLowerCase();
  if (aLC < bLC) {
    return -1;
  }
  else if (aLC > bLC) {
    return 1;
  }
  else {
    return 0;
  }
});
const data = {
  batchData,
  result
};
fs.writeFileSync(
  `${dir}/bulks.json`, `${JSON.stringify(data, null, 2)}\n`
);
