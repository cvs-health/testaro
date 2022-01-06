/*
  aatt
  This test implements the HTML CodeSniffer ruleset for accessibility via AATT.
*/

// IMPORTS
const {evaluate} = require('aatt');

// FUNCTIONS
exports.reporter = async page => {
  // Get the HTML of the document body.
  const source = await page.content();
  // Return the result of a test with the HTML CodeSniffer WCAG 2.1 AA ruleset as a string.
  const report = await evaluate({
    source,
    output: 'json',
    engine: 'htmlcs',
    level: 'WCAG2AA'
  });
  // Remove the non-JSON prefix from the string.
  const reportJSON = report.replace(/^.+?\n/, '');
  // Convert the JSON string to an array.
  const issueArray = JSON.parse(reportJSON);
  // Remove the notices from the array.
  const majorIssues = issueArray.filter(issue => issue.type !== 'notice');
  return {result: majorIssues};
};
