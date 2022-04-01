/*
  aatt
  This test implements the HTML CodeSniffer ruleset for accessibility via AATT.
*/

// IMPORTS
const {evaluate} = require('aatt');

// FUNCTIONS
exports.reporter = async (page, waitLong) => {
  // Set the limit in seconds on the wait for the result.
  const timeLimit = waitLong ? 20 : 10;
  // Get the HTML of the document body.
  const source = await page.content();
  // Return the result of a test with the HTML CodeSniffer WCAG 2.1 AA ruleset as a string.
  const report = evaluate({
    source,
    output: 'json',
    engine: 'htmlcs',
    level: 'WCAG2AA'
  });
  // Wait for it until the time limit expires.
  let timeoutID;
  const wait = new Promise(resolve => {
    timeoutID = setTimeout(() => {
      resolve('');
    }, 1000 * timeLimit);
  });
  const resultIfFast = await Promise.race([report, wait]);
  // If it arrived within the time limit:
  if (resultIfFast) {
    clearTimeout(timeoutID);
    // Remove the non-JSON prefix and (if any) suffix from the string.
    const reportJSON = resultIfFast.replace(/^.+?Object]\s+|\s+done\s*$/sg, '');
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
      return {result: nonNotices};
    }
    catch (error) {
      console.log(`ERROR processing AATT report (${error.message})`);
      return {result: 'ERROR processing AATT report'};
    }
  }
  // Otherwise, i.e. if the result did not arrive within the time limit:
  else {
    // Report the failure.
    console.log('ERROR: getting report took too long');
    return {result: 'ERROR: getting AATT report took too long'};
  }
};
