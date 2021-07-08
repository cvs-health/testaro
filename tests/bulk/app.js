// Reports the count of visible elements.
exports.reporter = async page => {
  const visibleElements = await page.$$('body :visible');
  return {result: {visibleElements: visibleElements.length}};
};
