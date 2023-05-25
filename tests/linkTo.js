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
  if (withItems) {
    data.items = badLinkTexts;
  }
  const totals = [data.total];
  const standardInstances = [];
  data.items.forEach(item => {
    standardInstances.push({
      issueID: 'linkTo',
      what: 'Element a has no href attribute',
      ordinalSeverity: 0,
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: item
    });
  });
  return {
    data,
    totals,
    standardInstances
  };
};
