// Reports the count of visible elements.
exports.reporter = async page => {
  const data = {};
  await page.waitForSelector('body', {timeout: 10000})
  .catch(error => {
    console.log(`ERROR (${error.message})`);
    data.error = 'ERROR: bulk timed out';
    return {result: data};
  });
  const visibleElements = await page.$$('body :visible');
  data.visibleElements = visibleElements.length;
  return {result: data};
};
