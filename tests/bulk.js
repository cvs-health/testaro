// Reports the count of visible elements.
exports.reporter = async page => {
  await page.waitForSelector('body', {timeout: 10000})
  .catch(error => {
    console.log(`ERROR AWAITING BODY (${error.message})`);
    return {result: 'BULK TEST TIMED OUT'};
  });
  const visibleElements = await page.$$('body :visible');
  return {result: {visibleElements: visibleElements.length}};
};
