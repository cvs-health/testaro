/*
  linkTitle
  Related to Tenon rule 79.
  This test reports links with title attributes with values contained in the link text contents.
*/
exports.reporter = async (page, withItems) => {
  // Identify the links with target=_blank attributes.
  const badLinkData = await page.$$eval(
    'a[title]',
    titleLinks => {
      // FUNCTION DEFINITIONS START
      // Returns a space-minimized copy of a string.
      const compact = string => string.replace(/[\t\n]/g, ' ').replace(/\s{2,}/g, ' ').trim();
      const lcCompact = string => compact(string).toLowerCase();
      // FUNCTION DEFINITIONS END
      const badLinks = titleLinks.filter(link => lcCompact(link.textContent).includes(lcCompact(link.title)));
      return badLinks.map(badLink => ({
        id: badLink.id || '',
        text: compact(badLink.textContent)
      }));
    }
  );
  const data = {
    total: badLinkData.length
  };
  const totals = [data.total, 0, 0, 0];
  const standardInstances = [];
  if (withItems) {
    data.items = badLinkData;
    data.items.forEach(item => {
      standardInstances.push({
        ruleID: 'linkTitle',
        what: 'Element a has a title attribute that repeats link text content',
        ordinalSeverity: 0,
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
      ruleID: 'linkTitle',
      what: 'Links have title attributes that repeat link text contents',
      count: data.total,
      ordinalSeverity: 0,
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
