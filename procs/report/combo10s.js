/*
  a11yHeros.js
  Extracts data from a JSON file containing an array of combo10 reports from a batch.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// ########## OPERATION
// Report directory.
const reportDir = `${__dirname}/../../doc/reports/batch`;
// Start of the base of the name of the report file (command-line argument).
const reportNameStart = process.argv[2];
fs.readFile(`${reportDir}/${reportNameStart}-report.json`, 'utf8')
.then(arrayJSON => {
  const reportArray = JSON.parse(arrayJSON);
  const scoreArray = reportArray.map(item => ({
    url: item.acts[1].which,
    org: item.acts[1].what,
    deficit: item.acts[2].result.deficit.total
  }))
  .sort((a, b) => a.deficit - b.deficit);
  fs.writeFile(
    `${reportDir}/${reportNameStart}-scores.json`, `${JSON.stringify(scoreArray, null, 2)}\n`
  );
});
