// Reports the count of visible elements.
exports.reporter = async page => {
  await page.waitForSelector('body');
  const visibleElements = await page.$$('body :visible');
  return {result: {visibleElements: visibleElements.length}};
};
