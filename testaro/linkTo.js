/*
  linkTo
  Derived from the bbc-a11y anchorsMustHaveHrefs test.
  This test reports failures to equip links with destinations.
*/
exports.reporter = async (page, withItems) => {
  // Identify the visible links without href attributes.
  const badLinkData = await page.$$eval(
    'a:not([href]):visible',
    badLinks => {
      // FUNCTION DEFINITION START
      // Returns a space-minimized copy of a string.
      const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
      // FUNCTION DEFINITION END
      return badLinks.map(link => ({
        id: link.id,
        text: compact(link.textContent)
      }));
    }
  );
  const data = {
    total: badLinkData.length
  };
  const totals = [0, 0, data.total, 0];
  const standardInstances = [];
  if (withItems) {
    data.items = badLinkData;
    data.items.forEach(item => {
      standardInstances.push({
        ruleID: 'linkTo',
        what: 'Element a has no href attribute',
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
      ruleID: 'linkTo',
      what: 'Links are missing href attributes',
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
