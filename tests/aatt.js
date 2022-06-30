/*
  aatt
  This test implements the HTML CodeSniffer ruleset.
*/

// FUNCTIONS
// Runs HTML CodeSniffer on the page.
exports.reporter = async page => {
  await page.addScriptTag({
    path: `${__dirname}/../htmlcs/HTMLCS.js`
  });
  await page.evaluate(() => {
    HTMLCS_RUNNER.run('WCAG2AAA');
  });
  return {result: 'HTML CodeSniffer has been run'};
};
