// Returns counts, and texts if required, of elements with non-auto z indexes.
exports.reporter = async (page, withItems) => {
  // Get data on the elements with non-auto z indexes.
  const data = await page.$$eval('body *', (elements, withItems) => {
    // Initialize the data.
    const data = {
      totals: {
        total: 0,
        tagNames: {}
      }
    };
    if (withItems) {
      data.items = [];
    }
    const addElementFacts = element => {
      const tagName = element.tagName;
      const tagNames = data.totals.tagNames;
      if (tagNames[tagName]) {
        tagNames[tagName]++;
      }
      else {
        tagNames[tagName] = 1;
      }
      if (withItems) {
        data.items.push({
          tagName,
          text: element.textContent.trim().replace(/\s{2,}/g, ' ').slice(0, 100)
        });
      }
    };
    elements.forEach(element => {
      if (window.getComputedStyle(element)['z-index'] !== 'auto') {
        data.totals.total++;
        addElementFacts(element);
      }
    });
    return data;
  }, withItems);
  return {result: data};
};
