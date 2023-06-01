/*
  linkTo
  Derived from the bbc-a11y anchorsMustHaveHrefs test.
  This test reports failures to equip links with destinations.
*/
exports.reporter = async (page, withItems) => {
  // Identify the visible links without href attributes.
  const badLinkTexts = await page.$$eval(
    'a:not([href]):visible',
    badLinks => {
      // FUNCTION DEFINITION START
      // Returns a space-minimized copy of a string.
      const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
      // FUNCTION DEFINITION END
      return badLinks.map(link => compact(link.textContent));
    }
  );
  const data = {
    total: badLinkTexts.length
  };
  const totals = [0, 0, data.total, 0];
  const standardInstances = [];
  if (withItems) {
    data.items = badLinkTexts;
    data.items.forEach(item => {
      standardInstances.push({
        issueID: 'linkTo',
        what: 'Element a has no href attribute',
        ordinalSeverity: 2,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: item
      });
    });
  }
  else if (data.total) {
    standardInstances.push({
      issueID: 'linkTo',
      what: 'Links are missing href attributes',
      count: data.total,
      ordinalSeverity: 2,
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
