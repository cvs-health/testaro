/*
  allHidden
  This test reports a page that is entirely or mainly hidden.
*/
exports.reporter = async page => {
  // Gets the hiddennesses of the document, body, and main region.
  const data = await page.evaluate(() => {
    // For each region:
    const {body} = document;
    const main = body && body.querySelector('main, [role=main]');
    const data = [];
    [document.documentElement, body, main].forEach(region => {
      if (! region) {
        data.push(null);
      }
      else if (region.hidden || region.ariaHidden) {
        data.push(true);
      }
      else {
        const styleDec = window.getComputedStyle(region);
        const {display, visibility} = styleDec;
        data.push(display === 'none' || visibility === 'hidden');
      }
    });
    return data;
  });
  // Get the severity totals.
  const totals = [0, data[2] ? 1 : 0, data[1] ? 1 : 0, data[0] ? 1 : 0];
  const standardInstances = [];
  data.forEach((isHidden, index) => {
    const region = [['Document', 'HTML'], ['Body', 'BODY'], ['Main region', 'MAIN']][index];
    if (isHidden) {
      standardInstances.push({
        ruleID: 'allHidden',
        what: `${region[0]} is hidden`,
        ordinalSeverity: 3 - index,
        tagName: region[1],
        id: '',
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      });
    }
  });
  return {
    data,
    totals,
    standardInstances
  };
};
