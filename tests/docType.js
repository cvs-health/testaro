/*
  docType
  Derived from the bbc-a11y allDocumentsMustHaveAW3cRecommendedDoctype test.
  This test reports a failure to equip the page document with a W3C-recommended doctype.
*/
exports.reporter = async page => {
  // Identify the visible links without href attributes.
  const docType = await page.evaluate(() => document.doctype);
  return {result: {
    docHasType: Boolean(docType)
  }};
};
