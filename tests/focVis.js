/*
  focVis
  Derived from the bbc-a11y elementsMustBeVisibleOnFocus test.
  This test reports links that are off the display when focused.
*/
exports.reporter = async (page, withItems) => {
  // Identify the initially visible links.
  const badLinks = await page.$$eval('a:visible', links => {
    // FUNCTION DEFINITION START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
    // FUNCTION DEFINITION END
    const badLinks = [];
    links.forEach(link => {
      link.focus();
      if (link.offsetTop + link.offsetHeight <= 0 || link.offsetLeft + link.offsetWidth <= 0) {
        badLinks.push(compact(link.textContent));
      }
    });
    return badLinks;
  });
  const data = {
    total: badLinks.length
  };
  if (withItems) {
    data.items = badLinks;
  }
  const totals = [data.total];
  const standardInstances = [];
  if (data.items) {
    data.items.forEach(item => {
      standardInstances.push({
        issueID: 'focVis',
        what: 'Visible link is above or to the left of the display',
        ordinalSeverity: 0,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: item
      });
    });
  }
  return {
    data,
    totals,
    standardInstances
  };
};
