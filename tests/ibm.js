// Import required modules.
const fs = require('fs/promises');
const {getCompliance} = require('accessibility-checker');
// Runs the IBM test.
const run = async content => {
  const nowLabel = (new Date()).toISOString().slice(0, 19);
  // Return the result of a test, or blank if 20 seconds elapse.
  return await Promise.race([
    getCompliance(content, nowLabel),
    new Promise(resolve => setTimeout(() => resolve(''), 20000))
  ])
  .catch(error => {
    console.log(`ERROR running ibm test (${error.message})`);
    return null;
  });
};
// Reports the result of an IBM test.
const report = (result, withItems) => {
  const data = {};
  if (result) {
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
  return data;
};
const all = {};
// Returns results of an IBM test.
exports.reporter = async (page, withItems, withNewContent) => {
  // If the test is to be conducted with existing content:
  if (! withNewContent) {
    // Conduct and report it.
    const content = await page.content();
    const result = await run(content);
    all.content = report(result, withItems);
  }
  // If the test is to be conducted with a URL:
  if ([true, undefined].includes(withNewContent)) {
    // Conduct and report it.
    const content = page.url();
    const result = await run(content);
    all.url = report(result, withItems);
  }
  // Delete the report files.
  fs.rm('ibmtemp', {recursive: true})
  .catch(error => console.log(`ERROR deleting temporary ibm files (${error.message})`));
  // Return the result.
  return {result: all};
};
