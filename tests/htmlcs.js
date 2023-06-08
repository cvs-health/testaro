/*
  htmlcs
  This test implements the HTML CodeSniffer ruleset.
*/

// FUNCTIONS
// Runs HTML CodeSniffer on the page.
exports.reporter = async (page, options) => {
  const {rules} = options;
  const result = {};
  // Add the HTMLCS script to the page.
  await page.addScriptTag({
    path: `${__dirname}/../htmlcs/HTMLCS.js`
  })
  .catch(error => {
    console.log(`ERROR adding the htmlcs script to the page (${error.message})`);
    result.prevented = true;
    result.error = 'ERROR adding the htmlcs script to the page';
  });
  if (! result.prevented) {
    let messageStrings = [];
    // Define the rules to be employed as those of WCAG 2 level AAA.
    for (const standard of ['WCAG2AAA']) {
      const nextIssues = await page.evaluate(args => {
        const standard = args[0];
        const rules = args[1];
        // If only some rules are to be employed:
        if (rules && Array.isArray(rules) && rules.length) {
          // Redefine WCAG 2 AAA as including only them.
          if (! window.HTMLCS_WCAG2AAA) {
            window.HTMLCS_WCAG2AAA = {};
          }
          window.HTMLCS_WCAG2AAA.sniffs = rules;
        }
        // Run the tests.
        let issues = null;
        try {
          issues = window.HTMLCS_RUNNER.run(standard);
        }
        catch(error) {
          console.log(`ERROR executing HTMLCS_RUNNER on ${document.URL} (${error.message})`);
        }
        return issues;
      }, [standard, rules]);
      if (nextIssues && nextIssues.every(issue => typeof issue === 'string')) {
        messageStrings.push(... nextIssues);
      }
      else {
        result.prevented = true;
        result.error = 'ERROR executing HTMLCS_RUNNER in the page';
        break;
      }
    }
    if (! result.prevented) {
      // Sort the issues by class and standard.
      messageStrings.sort();
      // Remove any duplicate issues.
      messageStrings = [... new Set(messageStrings)];
      // Initialize the result.
      result.Error = {};
      result.Warning = {};
      // For each issue:
      messageStrings.forEach(string => {
        const parts = string.split(/\|/, 6);
        const partCount = parts.length;
        if (partCount < 6) {
          console.log(`ERROR: Issue string ${string} has too few parts`);
        }
        // If it is an error or a warning (not a notice):
        else if (['Error', 'Warning'].includes(parts[0])) {
          /*
            Add the issue to an issueClass.issueCode.description array in the result.
            This saves space, because, although some descriptions are issue-specific, such as
            descriptions that state the contrast ratio of an element, most descriptions are
            generic, so typically many issues share a description.
          */
          const issueCode = parts[1].replace(/^WCAG2|\.Principle\d\.Guideline[\d_]+/g, '');
          if (! result[parts[0]][issueCode]) {
            result[parts[0]][issueCode] = {};
          }
          if (! result[parts[0]][issueCode][parts[4]]) {
            result[parts[0]][issueCode][parts[4]] = [];
          }
          result[parts[0]][issueCode][parts[4]].push({
            tagName: parts[2],
            id: parts[3],
            code: parts[5]
          });
        }
      });
    }
  }
  return {result};
};
