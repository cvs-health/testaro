/*
  scoreTable.js
  Converts scoreAgg output from JSON to an HTML bar-graph table.
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
// Get the data.
const dataJSON = fs.readFileSync(`${dir}/deficit.json`, 'utf8');
const data = JSON.parse(dataJSON);
const result = data.result;
// Identify the containing HTML code.
const tableStartLines = [
  '<table class="allBorder">',
  '  <caption>Accessibility deficits of web pages</caption>',
  '  <thead>',
  '    <tr><th rowspan="2">Page</th><th colspan="2">Deficit as a</th></tr>',
  '    <tr><th>Number</th><th>Bar</th>',
  '  </thead>',
  '  <tbody class="secondCellRight">'
];
const tableEndLines = [
  '  </tbody>',
  '</table>'
];
// Calibrate the bar widths.
const maxDeficit = result.reduce((max, thisItem) => Math.max(max, thisItem.deficit.total), 0);
// Compile the HTML code representing the data.
const tableMidLines = result.map(item => {
  const pageCell = `<th><a href="${item.url}">${item.org}</a></th>`;
  const numCell = `<td><a href="data/${item.fileName}">${item.deficit.total}</a></td>`;
  const barWidth = maxDeficit ? 100 * item.deficit.total / maxDeficit : 0;
  const bar = `<rect height="100%" width="${barWidth}%" fill="red"></rect>`;
  const barCell = `<td><svg width="100%" height="1rem">${bar}</svg></td>`;
  const row = `    <tr>${pageCell}${numCell}${barCell}</tr>`;
  return row;
});
// Combine the containing and contained lines of HTML code.
const tableLines = tableStartLines.concat(tableMidLines, tableEndLines);
const table = tableLines.join('\n');
// Create the file.
fs.writeFileSync(`${dir}/deficit.html`, `${table}\n`);
