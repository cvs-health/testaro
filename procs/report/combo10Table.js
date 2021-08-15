/*
  combo10Table.js
  Converts combo10 data from JSON to an HTML table.
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
const tableStartLines = [
  '<table>',
  '  <thead>',
  '    <tr><th>Page</th><th>Deficit</th><th>URL</th></tr>',
  '  </thead>',
  '  <tbody>'
];
const tableEndLines = [
  '  </tbody>',
  '</table>'
];
const maxDeficit = data.reduce((max, currentItem) => Math.max(max, currentItem.deficit));
const tableMidLines = data.map(item => {
  const orgCell = `<td class="right">${item.org}</td>`;
  const deficitCell = `<td class="right">${item.deficit}</td>`;
  const barWidth = 100 * item.deficit / maxDeficit;
  const bar = `<rect height="100%" width="${barWidth}% fill="red"></rect>`;
  const barCell = `<td><svg width="100%" height="100%">${bar}</svg></td>`;
  const row = `    <tr>${orgCell}${deficitCell}${barCell}</tr>`;
  return row;
});
const tableLines = tableStartLines.concat(tableMidLines, tableEndLines);
const table = tableLines.join('\n ');
fs.writeFileSync(`${reportDir}/${reportSubdir}/${fileID}.html`, `${table}\n`);
