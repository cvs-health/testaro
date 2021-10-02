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
  const nowLabel = (new Date()).toISOString().slice(0, 19);
  const result = await Promise.race([
    getCompliance(content, nowLabel),
    new Promise(resolve => setTimeout(() => resolve(''), 15000))
  ]);
  // Identify a report of the result.
  const data = {};
  if (result) {
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
    data.error = 'ERROR: ibm test failed';
  }
  // Reload the page to undo any DOM changes made by IBM.
  await require('../procs/test/reload').reload(page);
  // Return it.
  return {result: data};
};
