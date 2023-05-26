/*
  docType
  Derived from the bbc-a11y allDocumentsMustHaveAW3cRecommendedDoctype test.
  This test reports a failure to equip the page document with a W3C-recommended HTML doctype.
*/
exports.reporter = async page => {
  // Identify the visible links without href attributes.
  const docHasType = await page.evaluate(() => {
    const docType = document.doctype;
    const docHasType = !! docType && docType.name && docType.name.toLowerCase() === 'html';
    return docHasType;
  });
  return {
    data: {docHasType},
    totals: [0, 0, 0, docHasType ? 0 : 1],
    standardInstances: docHasType ? [] : [{
      issueID: 'docType',
      what: 'Document has no standard HTML doctype preamble',
      ordinalSeverity: 3,
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    }]
  };
};
