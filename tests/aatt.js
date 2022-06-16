/*
  aatt
  This test implements the HTML CodeSniffer ruleset for accessibility via AATT.
*/

// IMPORTS
const {evaluate} = require('aatt');

// FUNCTIONS
// Recursively test a page with HTML CodeSniffer for WCAC 2.1 AAA.
const retest = async (page, waitLong, triesLeft) => {
  // If the limit on tries has not been exhausted:
  if (triesLeft) {
    // Set the limit in seconds on the wait for the result.
    const timeLimit = waitLong ? 30 : 6;
    // Get the HTML of the document body.
    const source = await page.content();
    // Return the result of a test with the HTML CodeSniffer WCAG 2.1 AA ruleset as a string.
    const report = evaluate({
      source,
      output: 'json',
      engine: 'htmlcs',
      level: 'WCAG2AAA'
    });
    // Wait for it until the time limit expires.
    let timeoutID;
    const wait = new Promise(resolve => {
      timeoutID = setTimeout(() => {
        resolve('');
      }, 1000 * timeLimit);
    });
    const result = await Promise.race([report, wait]);
    // If it arrived within the time limit:
    if (result) {
      clearTimeout(timeoutID);
      // Return the result as JSON.
      const reportJSON = result.replace(/^.+?Object.?\s+|\s+done\s*$/sg, '');
      return {
        triesLeft,
        reportJSON
      };
    }
    else {
      console.log(`ERROR: Test aatt timed out at ${timeLimit} seconds with ${triesLeft} tries left`);
      return retest(page, waitLong, --triesLeft);
    }
  }
  // Otherwise, i.e. if the limit on tries has been exhausted:
  else {
    // Return this.
    return {
      triesLeft,
      reportJSON: ''
    };
  }
};
exports.reporter = async (page, waitLong, tryLimit = 4) => {
  // Try the test up to the limit on tries.
  const result = await retest(page, waitLong, tryLimit);
  const {triesLeft, reportJSON} = result;
  // If any try succeeded:
  if (reportJSON) {
    try {
      // Convert the JSON string to an array.
      const issueArray = JSON.parse(reportJSON);
      // Remove the notices from the array.
      const nonNotices = issueArray.filter(issue => issue.type !== 'notice');
      // Convert the technique property from a string to an array of strings.
      nonNotices.forEach(issue => {
        if (issue.type) {
          const longTech = issue.techniques;
          issue.techniques = longTech.replace(/a><a/g, 'a>%<a').split('%');
          issue.id = issue
          .techniques
          .map(technique => technique.replace(/^.+?>|<\/a>$/g, ''))
          .sort()
          .join('+');
        }
      });
      return {
        result: {
          report: nonNotices,
          triesLeft
        }
      };
    }
    catch (error) {
      console.log(`ERROR processing AATT report (${error.message})`);
      return {
        result: {
          prevented: true,
          error: 'ERROR processing AATT report'
        }
      };
    }
  }
  // Otherwise, i.e. if the limit on tries was exhausted:
  else {
    // Report the failure.
    console.log('ERROR: getting report took too long');
    return {
      result: {
        prevented: true,
        error: 'ERROR: getting AATT report took too long'
      }
    };
  }
};
