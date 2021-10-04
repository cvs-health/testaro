/*
  replaceTest.js
  Replaces results of a test in the reports of a batch and adjusts the score. Existing reports
  must be in a “reports” subdirectory. The new test’s reports must be in a “newTest”
  subdirectory. A “newReports” subdirectory must exist; the amended reports will be put into it.
  Arguments:
    0. Subdirectory of report directory.
    1. Name of test to be replaced.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Directory.
const dir = `${process.env.REPORTDIR}/${process.argv[2]}`;
const test = process.argv[3];
// Identify the reports.
const reportNames = fs.readdirSync(`${dir}/reports`);
const newFileNames = fs.readdirSync(`${dir}/newTest`);
const finder = {};
newFileNames.forEach(fn => {
  const who = JSON.parse(fs.readFileSync(`${dir}/newTest/${fn}`))
  .acts
  .filter(act => act.type === 'url')[0]
  .what;
  finder[who] = fn;
});
// Replace the test results to the reports with the new results.
reportNames.forEach(rn => {
  const reportData = JSON.parse(fs.readFileSync(`${dir}/reports/${rn}`));
  const who = reportData.acts.filter(act => act.type === 'url')[0].what;
  const newReportName = finder[who];
  if (newReportName) {
    const newReportData = JSON.parse(fs.readFileSync(`${dir}/newTest/${newReportName}`, 'utf8'));
    const testIndex = reportData.acts.findIndex(act => act.type === 'test' && act.which === test);
    reportData.acts.splice(testIndex, 1, newReportData.acts.filter(act => act.type === 'test')[0]);
    const scoreData = reportData.acts.filter(act => act.type === 'score')[0].result;
    const deficit = scoreData.deficit;
    let oldScore = deficit[test];
    if (oldScore === null) {
      oldScore = scoreData.inferences[test];
    }
    const oldTotal = deficit.total;
    const newScore = newReportData.acts.filter(act => act.type === 'score')[0].result.deficit[test];
    deficit[test] = newScore;
    console.log(`Changed ${test} score for ${who} from ${oldScore} to ${newScore}`);
    const newTotal = oldTotal +newScore - oldScore;
    deficit.total = newTotal;
    console.log(`Changed total score for ${who} from ${oldTotal} to ${newTotal}`);
    fs.writeFileSync(`${dir}/newReports/${rn}`, `${JSON.stringify(reportData, null, 2)}\n`);
  }
  else {
    console.log(`No new test result found for ${who} (${rn})`);
  }
});
