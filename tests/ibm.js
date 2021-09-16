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
  const result = await getCompliance(content, nowLabel);
  fs.rm('ibmtemp', {recursive: true});
  // Identify a report of the result.
  const data = {
    result: {
      totals: result.report.summary.counts
    }
  };
  if (withItems) {
    data.result.items = result.report.results;
    data.result.items.forEach(item => {
      delete item.apiArgs;
      delete item.category;
      delete item.ignored;
      delete item.messageArgs;
      delete item.reasonId;
      delete item.ruleTime;
      delete item.value;
    });
  }
  // Reload the page to undo any DOM changes made by IBM.
  await page.reload({timeout: 10000}).catch(error => {
    console.log(`ERROR RELOADING PAGE AFTER IBM: ${error.message}`);
  });
  // Return it.
  return data;
};
