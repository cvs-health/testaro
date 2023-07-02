/*
  linkAmb
  Related to Tenon rule 98.
  This test reports text contents that are shared by links with distinct destinations.
  Text contents are compared case-insensitively.
*/
exports.reporter = async (page, withItems) => {
  // Identify the visible links with destinations.
  const badLinkTexts = await page.$$eval(
    'a[href]:visible',
    links => {
      // FUNCTION DEFINITION START
      // Returns a space-minimized copy of a string.
      const compact = string => string.replace(/[\t\n]/g, ' ').replace(/\s{2,}/g, ' ').trim().toLowerCase();
      // FUNCTION DEFINITION END
      // Initialize the result.
      const linkTexts = {};
      links.forEach(link => {
        const linkText = compact(link.textContent);
        if (! linkTexts[linkText]) {
          linkTexts[linkText] = [];
        }
        if (! linkTexts[linkText].includes(link.href)) {
          linkTexts[linkText].push(link.href);
        }
      });
      Object.keys(linkTexts).forEach(linkText => {
        if (linkTexts[linkText].length < 2) {
          delete linkTexts[linkText];
        }
      });
      return linkTexts;
    }
  );
  // Initialize the result and the standard result.
  const data = {
    total: Object.values(badLinkTexts).reduce((total, current) => total + current.length - 1, 0)
  };
  const totals = [0, 0, data.total, 0];
  const standardInstances = [];
  if (withItems) {
    data.items = badLinkTexts;
    Object.keys(badLinkTexts).forEach(badText => {
      const textSpec = badText.length > 200
        ? `${badText.slice(0, 100)} … ${badText.slice(-100)}`
        : badText;
      const destinationSpec = badLinkTexts[badText].join(', ');
      standardInstances.push({
        ruleID: 'linkAmb',
        what: `Link text has multiple destinations: ${destinationSpec}`,
        ordinalSeverity: 2,
        tagName: 'A',
        id: '',
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: textSpec
      });
    });
  }
  else if (data.total) {
    standardInstances.push({
      ruleID: 'linkAmb',
      what: 'Link texts have multiple destinations',
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
