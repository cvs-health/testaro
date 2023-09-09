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
  const visiblesLoc = await page.locator('body :visible');
  const visibleLocs = await visiblesLoc.all();
  data.visibleElements = visibleLocs.length;
  const severity = Math.min(4, Math.round(data.visibleElements / 400));
  const totals = [0, 0, 0, 0];
  if (severity) {
    totals[severity - 1] = 1;
  }
  return {
    data,
    totals,
    standardInstances: data.visibleElements < 200 ? [] : [{
      ruleID: 'bulk',
      what: 'Page contains a large number of visible elements',
      ordinalSeverity: severity - 1,
      tagName: 'HTML',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    }]
  };
};
