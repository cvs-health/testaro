/*
  addTest.js
  Adds results of a test to the reports of a batch. Existing reports must be in a “reports”
  subdirectory. The new test’s reports must be in a “newTest” subdirectory. A “newReports”
  subdirectory must exist; the amended reports will be put into it.
  Arguments:
    0. Subdirectory of report directory.
    1. Name of test to be added.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Directory.
const dir = `${process.env.REPORTDIR}/${process.argv[2]}`;
const newTest = process.argv[3];
// Identify the reports.
const reportNames = fs.readdirSync(`${dir}/reports`);
const newFileNames = fs.readdirSync(`${dir}/newTest`);
const finder = {};
newFileNames.forEach(fn => {
  console.log(`Processing ${fn}`);
  const who = JSON.parse(fs.readFileSync(`${dir}/newTest/${fn}`))
  .acts
  .filter(act => act.type === 'url')[0]
  .what;
  finder[who] = fn;
});
// Add the new test results to the reports.
reportNames.forEach(rn => {
  const reportData = JSON.parse(fs.readFileSync(`${dir}/reports/${rn}`));
  const who = reportData.acts.filter(act => act.type === 'url')[0].what;
  const newReportName = finder[who];
  if (newReportName) {
    const newReportData = JSON.parse(fs.readFileSync(`${dir}/newTest/${newReportName}`, 'utf8'));
    const newScore = newReportData.acts.filter(act => act.type === 'score')[0].result[newTest];
    const scoreResult = reportData.acts.filter(act => act.type === 'score')[0].result;
    scoreResult[newTest] = newScore;
    scoreResult.total += newScore || 0;
    fs.writeFileSync(`${dir}/newReports/rn`, `${JSON.stringify(reportData, null, 2)}\n`);
  }
  else {
    console.log(`No new test result found for ${who} (${rn})`);
  }
});
