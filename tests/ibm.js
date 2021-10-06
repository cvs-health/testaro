// Import required modules.
const fs = require('fs/promises');
const {getCompliance} = require('accessibility-checker');
// Returns results of an IBM test.
exports.reporter = async (page, withItems, withNewContent) => {
  /*
    Identify whether this test should refetch the page. Some pages crash this test unless
    withNewContent is true.
  */
  const content = withNewContent ? page.url() : await page.content();
  // Run the test and get the result. Delete the report file.
  let nowLabel = (new Date()).toISOString().slice(0, 19);
  let result = await Promise.race([
    getCompliance(content, nowLabel),
    new Promise(resolve => setTimeout(() => resolve(''), 20000))
  ])
  .catch(error => {
    console.log(`ERROR running ibm test (${error.message})`);
    return null;
  });
  const data = {};
  if (! result) {
    console.log(' ERROR: ibm test failed; trying again');
    nowLabel = (new Date()).toISOString().slice(0, 19);
    result = await Promise.race([
      getCompliance(content, nowLabel),
      new Promise(resolve => setTimeout(() => resolve(''), 20000))
    ])
    .catch(error => {
      console.log(`ERROR: ibm retest failed (${error.message})`);
      return null;
    });
  }
  // If the test succeeded on either the first or second try:
  if (result) {
    // Identify a report of the result.
    fs.rm('ibmtemp', {recursive: true});
    data.totals = result.report.summary.counts;
    if (withItems) {
      data.items = result.report.results;
      data.items.forEach(item => {
        delete item.apiArgs;
        delete item.category;
        delete item.ignored;
        delete item.messageArgs;
        delete item.reasonId;
        delete item.ruleTime;
        delete item.value;
      });
    }
  }
  else {
    data.error = 'ERROR: ibm test failed again';
  }
  // Return it.
  return {result: data};
};
