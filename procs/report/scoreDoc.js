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
// Populate it.
const fileNames = fs.readdirSync(`${dir}/reports`);
fileNames.forEach(fn => {
  const sourceJSON = fs.readFileSync(`${dir}/reports/${fn}`, 'utf8');
  const sourceData = JSON.parse(sourceJSON);
  const testActs = sourceData.acts.filter(act => act.type === 'test');
  const testData = {};
  testActs.forEach(act => {
    testData[act.which] = act;
  });
  const scoreData = sourceData.acts.find(act => act.type === 'score').result.deficit;
  scoreProc || (scoreProc = scoreData.scoreProc);
  version || (version = scoreData.version);
  const orgData = sourceData.acts.find(act => act.type === 'url');
  const paramData = require(`../../docTemplates/${docSubdir}/index`)
  .parameters(fn, sourceData, testData, scoreData, scoreProc, version, orgData);
});
fs.writeFileSync(
  `${dir}/deficit.json`, `${JSON.stringify(data, null, 2)}\n`
);
