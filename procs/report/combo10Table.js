/*
  combo10Table.js
  Converts combo10 data from JSON to TSV.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
// Directories.
const reportDir = process.env.BATCHREPORTDIR;
const reportSubdir = process.argv[2];
const fileID = process.argv[3];
// Populate it.
const dataJSON = fs.readFileSync(`${reportDir}/${reportSubdir}/${fileID}.json`, 'utf8');
const data = JSON.parse(dataJSON);
const tsv = data.map(item => [item.deficit, item.org, item.url].join('\t')).join('\n');
fs.writeFileSync(`${reportDir}/${reportSubdir}/${fileID}.tsv`, `${tsv}\n`);
