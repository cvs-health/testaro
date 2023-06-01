/*
  bulk
  This test reports the count of visible elements.

  The test assumes that simplicity and compactness, with one page having one purpose,
  is an accessibility virtue. Users with visual, motor, and cognitive disabilities
  often have trouble finding what they want or understanding the purpose of a page
  if the page is cluttered with content.
*/
exports.reporter = async page => {
  const data = {};
  await page.waitForSelector('body', {timeout: 10000})
  .catch(error => {
    console.log(`ERROR (${error.message})`);
    data.prevented = true;
    data.error = 'ERROR: bulk timed out';
    return {result: data};
  });
  const visibleElements = await page.$$('body :visible');
  data.visibleElements = visibleElements.length;
  const count = Math.round(data.visibleElements / 400);
  return {
    data,
    totals: [count, 0, 0, 0],
    standardInstances: data.visibleElements < 200 ? [] : [{
      issueID: 'bulk',
      what: 'Page contains a large number of visible elements',
      count,
      ordinalSeverity: 0,
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    }]
  };
};
