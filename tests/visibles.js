// Reports the visible elements.
exports.reporter = async page => {
  const data = {};
  await page.waitForSelector('body', {timeout: 10000})
  .catch(error => {
    console.log(`ERROR (${error.message})`);
    data.error = 'ERROR: bulk timed out';
    return {result: data};
  });
  const visibleElements = await page.$$('body :visible');
  data.visibleElements = {
    total: visibleElements.length,
    texts: await Promise.all(visibleElements.map(async el => {
      const allText = await el.textContent();
      return allText.trim().replace(/\s {2,}/gs, ' ');
    }))
  };
  return {result: data};
};
