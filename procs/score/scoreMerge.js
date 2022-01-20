/*
  scoreMerge.js
  Merges multiple scoreAgg outputs.
  Arguments:
    0. Comma-delimited list of subdirectories of report directory.
    1. Subdirectory of the merged result.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Appends a source identifier to the org value.
const append = (data, appendum) => {
  data.result.forEach(item => {
    item.org += appendum;
  });
};
// Initialize the data with the first source.
const dir = process.env.REPORTDIR;
const subdirs = process.argv[2].split(',');
const firstJSON = fs.readFileSync(`${dir}/${subdirs[0]}/deficit.json`);
const data = JSON.parse(firstJSON);
// Append the source identifier to each item.
append(data, ` (${subdirs[0]})`);
// Add the other sources.
subdirs.slice(1).forEach(source => {
  const subdir = `${dir}/${source}`;
  const sourceJSON = fs.readFileSync(`${subdir}/deficit.json`, 'utf8');
  const sourceData = JSON.parse(sourceJSON);
  append(sourceData, ` (${source})`);
  data.result.push(...sourceData.result);
});
// Sort the items.
data.result.sort((a, b) => a.deficit.total - b.deficit.total);
// Create the result file.
fs.writeFileSync(`${dir}/${process.argv[3]}/deficit.json`, `${JSON.stringify(data, null, 2)}\n`);
