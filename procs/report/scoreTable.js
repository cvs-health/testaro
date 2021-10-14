/*
  scoreTable.js
  Converts scoreAgg output from JSON to an HTML bar-graph table.
  Arguments:
    0. Subdirectory of report directory.
    1. What columns to include:
      'aut': Autotest.
      'aa': Autotest and axe.
      'p3': Axe, IBM, and WAVE.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs');
// Module to keep secrets local.
require('dotenv').config();
// ########## OPERATION
const colSpec = process.argv[3];
// Directory.
const dir = `${process.env.REPORTDIR}/${process.argv[2]}`;
// Get the data.
const dataJSON = fs.readFileSync(`${dir}/deficit.json`, 'utf8');
const data = JSON.parse(dataJSON);
const result = data.result;
// Identify the containing HTML code.
const options = ['aut', 'aa', 'p3'];
const optionColNames = [['Autotest'], ['Autotest', 'Axe'], ['Axe', 'IBM', 'WAVE']];
const optionPropNames = [['total'], ['total', 'axe'], ['axe', 'ibm', 'wave']];
const colNames = optionColNames[options.indexOf(colSpec)];
const head0 = colNames.map(pair => `<th colspan="2">${pair}</th>`).join('');
const head1 = '<th>Number</th><th>Bar</th>'.repeat(colNames.length);
const tableClasses = ['secondCellRight'];
if (colSpec !== 'aut') {
  tableClasses.push('fourthCellRight');
  if (colSpec === 'p3') {
    tableClasses.push('sixthCellRight');
  }
}
const tableStartLines = [
  '<table class="allBorder">',
  '  <caption>Accessibility deficits of web pages</caption>',
  '  <thead>',
  `    <tr><th rowspan="2">Page</th>${head0}</tr>`,
  `    <tr>${head1}</tr>`,
  '  </thead>',
  `  <tbody class="${tableClasses.join(' ')}">`
];
const tableEndLines = [
  '  </tbody>',
  '</table>'
];
// Calibrate the bar widths.
const maxDeficits = {};
optionPropNames.forEach(propName => {
  maxDeficits[propName] = result.reduce(
    (max, thisItem) => Math.max(max, thisItem.deficit[propName]), 0
  );
});
// Compile the HTML code representing the data.
const tableMidLines = result.map(item => {
  const pageCell = `<th><a href="${item.url}">${item.org}</a></th>`;
  const numCells = [];
  if (optionPropNames.includes('total')) {
    numCells.push(`<td><a href="data/${item.fileName}">${item.deficit.total}</a></td>`);
  }
  optionPropNames.filter(name => name !== 'total').forEach(name => {
    const itemScore = item.deficit[name];
    numCells.push(`<td>${itemScore !== null ? itemScore : '?'}</td>`);
  });
  const barCells = [];
  optionPropNames.forEach(name => {
    const itemScore = item.deficit[name];
    if (itemScore === null) {
      barCells.push('<td>?</td>');
    }
    else {
      const barWidth = maxDeficits[name] ? 100 * item.deficit[name] / maxDeficits[name] : 0;
      const bar = `<rect height="100%" width="${barWidth}%" fill="red"></rect>`;
      barCells.push(`<td><svg width="100%" height="1rem">${bar}</svg></td>`);
    }
  });
  const numBarCells = numCells.map((cell, index) => `${cell}${barCells[index]}`);
  const row = `    <tr>${pageCell}${numBarCells.join('')}</tr>`;
  return row;
});
// Combine the containing and contained lines of HTML code.
const tableLines = tableStartLines.concat(tableMidLines, tableEndLines);
const table = tableLines.join('\n');
// Create the file.
fs.writeFileSync(`${dir}/deficit.html`, `${table}\n`);
