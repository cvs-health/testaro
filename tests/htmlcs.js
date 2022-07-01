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
  let messageStrings = [];
  for (const standard of ['WCAG2A', 'WCAG2AA', 'WCAG2AAA']) {
    const nextIssues = await page.evaluate(standard => HTMLCS_RUNNER.run(standard), standard);
    messageStrings.push(... nextIssues);
  }
  // Sort the issues by class and standard.
  messageStrings.sort();
  // Remove any duplicate issues.
  messageStrings = [... new Set(messageStrings)];
  // Initialize the result.
  const result = {
    Error: {},
    Warning: {}
  };
  // For each issue:
  messageStrings.forEach(string => {
    const parts = string.split(/\|/g);
    const partCount = parts.length;
    if (partCount !== 6) {
      console.log(`ERROR: Issue string ${string} has too few or too many parts`);
    }
    // If it is an error or a warning (not a notice):
    else if (['Error', 'Warning'].includes(parts[0])) {
      // Add the issue to the result.
      if (! result[parts[0]][parts[1]]) {
        result[parts[0]][parts[1]] = {
          description: parts[4],
          issues: []
        };
      }
      result[parts[0]][parts[1]].issues.push({
        tagName: parts[2],
        id: parts[3],
        code: parts[5]
      });
    }
  });
  return {result};
};
