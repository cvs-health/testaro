/*
  htmlcs
  This test implements the HTML CodeSniffer ruleset.
*/

// FUNCTIONS
// Runs HTML CodeSniffer on the page.
exports.reporter = async page => {
  await page.addScriptTag({
    path: `${__dirname}/../htmlcs/HTMLCS.js`
  });
  const messageStrings = [];
  for (const standard of ['WCAG2A', 'WCAG2AA', 'WCAG2AAA']) {
    const nextIssues = await page.evaluate(standard => HTMLCS_RUNNER.run(standard), standard);
    messageStrings.push(... nextIssues);
  }
  messageStrings.sort();
  const result = [];
  messageStrings.forEach(string => {
    const parts = string.split(/\|/g);
    const partCount = parts.length;
    if (partCount !== 6) {
      console.log(`ERROR: Issue string ${string} has too few or too many parts`);
    }
    else {
      result.push({
        issueType: parts[0],
        standard: parts[1],
        description: parts[4],
        tagName: parts[2],
        id: parts[3],
        code: parts[5]
      });
    }
  });
  return {result};
};
