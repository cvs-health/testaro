/*
  aatt
  This test implements the HTML CodeSniffer ruleset for accessibility via AATT.
*/
// IMPORTS
const {evaluate} = require('aatt');
exports.reporter = async page => {
  const source = await page.evaluate(() => document.body.innerHTML);
  const data = await evaluate({
    source,
    output: 'json',
    engine: 'htmlcs',
    level: 'WCAG2AA'
  });
  return {result: data};
};
