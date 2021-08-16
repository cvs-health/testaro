/*
  combo10Failures.js
  Tabulates the counts of artifacts failing tests in a combo10Details batch.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Directories.
const fromDir = process.env.BATCHREPORTDIR;
const subdir = process.argv[2];
const fileID = process.argv[3];
// Initialize the result.
const result = {
  axe: 0,
  wave1: 0,
  linkUl: 0,
  focOl: 0,
  focOp: 0,
  labClash: 0,
  radioSet: 0,
  roleS: 0,
  styleDiff: 0,
  bulk: 0
};
const tests = Object.keys(result);
// Populate it.
const dataJSON = fs.readFileSync(`${fromDir}/${subdir}/totals-${fileID}.json`, 'utf8');
const data = JSON.parse(dataJSON);
data.forEach(page => {
  tests.forEach(test => {
    if (page.deficit[test]) {
      result[test]++;
    }
  });
});
fs.writeFileSync(
  `${fromDir}/${subdir}/failures.json`, `${JSON.stringify(result, null, 2)}\n`
);
