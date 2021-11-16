/*
  scoreDoc.js
  Creates HTML reports from the JSON reports of a batch.
  Arguments:
    0. Subdirectory of the report directory.
    2. Subdirectory of the docTemplates directory.
    1. Score proc, if not in the JSON reports.
    2. Score-proc version, if not in the JSON reports.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
let [reportSubdir, docSubdir, scoreProc, version] = process.argv.slice(2);
// Directory.
const dir = `${process.env.REPORTDIR}/${reportSubdir}`;
const fileNames = fs.readdirSync(`${dir}/jsonReports`);
const {parameters} = require(`../../docTemplates/${docSubdir}/index`);
const template = fs.readFileSync(`./docTemplates/${docSubdir}/index.html`, 'utf8');
// For each JSON report file:
fileNames.forEach(fn => {
  // Get its content.
  const fileBase = fn.slice(0, -5);
  const sourceJSON = fs.readFileSync(`${dir}/jsonReports/${fn}`, 'utf8');
  const sourceData = JSON.parse(sourceJSON);
  // Get its data.
  const {testDate} = sourceData;
  const testActs = sourceData.acts.filter(act => act.type === 'test');
  const testData = {};
  testActs.forEach(act => {
    testData[act.which] = act;
  });
  const scoreData = sourceData.acts.find(act => act.type === 'score').result;
  scoreProc || (scoreProc = scoreData.scoreProc);
  version || (version = scoreData.version);
  const orgData = sourceData.acts.find(act => act.type === 'url');
  // Compute the values to be substituted for HTML template placeholders.
  const paramData = parameters(fn, testData, scoreData, scoreProc, version, orgData, testDate);
  // Replace the placeholders.
  const htmlReport = template
  .replace(/__([a-zA-Z]+)__/g, (placeHolder, param) => paramData[param]);
  fs.writeFileSync(`${dir}/htmlReports/${fileBase}.html`, htmlReport);
});
