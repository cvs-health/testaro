/*
  © 2022–2024 CVS Health and/or one of its affiliates. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  htmlcs
  This test implements the HTML CodeSniffer ruleset.
*/

// IMPORTS

// Module to handle files.
const fs = require('fs/promises');

// FUNCTIONS

// Conducts and reports the HTML CodeSniffer tests.
exports.reporter = async (page, report, actIndex) => {
  const act = report.acts[actIndex];
  const {rules} = act;
  const data = {};
  const result = {};
  // Get the HTMLCS script.
  const scriptText = await fs.readFile(`${__dirname}/../htmlcs/HTMLCS.js`, 'utf8');
  const scriptNonce = report.jobData && report.jobData.lastScriptNonce;
  // Define the rules to be employed as those of WCAG 2 level AAA.
  let messageStrings = [];
  for (const actStandard of ['WCAG2AAA']) {
    const nextIssues = await page.evaluate(args => {
      // Add the HTMLCS script to the page.
      const scriptText = args[2];
      const scriptNonce = args[3];
      const script = document.createElement('script');
      script.nonce = scriptNonce;
      script.textContent = scriptText;
      document.head.insertAdjacentElement('beforeend', script);
      // If only some rules are to be employed:
      const actStandard = args[0];
      const rules = args[1];
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
        issues = window.HTMLCS_RUNNER.run(actStandard);
      }
      catch(error) {
        console.log(`ERROR executing HTMLCS_RUNNER on ${document.URL} (${error.message})`);
      }
      return issues;
    }, [actStandard, rules, scriptText, scriptNonce]);
    if (nextIssues && nextIssues.every(issue => typeof issue === 'string')) {
      messageStrings.push(... nextIssues);
    }
    else {
      data.prevented = true;
      data.error = 'ERROR executing HTMLCS_RUNNER in the page';
      break;
    }
  }
  if (! data.prevented) {
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
          generic, so typically many violations share a description.
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
  return {
    data,
    result
  };
};
