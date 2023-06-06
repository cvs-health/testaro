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
        badLinks.push({
          id: link.id,
          text: compact(link.textContent)
        });
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
  const totals = [0, 0, data.total, 0];
  const standardInstances = [];
  if (data.items) {
    data.items.forEach(item => {
      standardInstances.push({
        issueID: 'focVis',
        what: 'Visible link is above or to the left of the display',
        ordinalSeverity: 2,
        tagName: 'A',
        id: item.id,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: item.text
      });
    });
  }
  else if (data.total) {
    standardInstances.push({
      issueID: 'focVis',
      what: 'Visible links are above or to the left of the display',
      count: data.total,
      ordinalSeverity: 2,
      tagName: 'A',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
  }
  return {
    data,
    totals,
    standardInstances
  };
};
