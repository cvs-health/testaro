// Reports links and buttons contained by links or buttons.
exports.reporter = async (page, withItems) => {
  return await page.$$('a a, a button, button a, button button', args => {
    const bads = args[0];
    const withItems = args[1];
    // FUNCTION DEFINITION START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
    // FUNCTION DEFINITION END
    const totals = {
      links: 0,
      buttons: 0
    };
    const items = [];
    // Total and, if requested, itemize the faulty elements.
    bads.forEach(bad => {
      const {tagName} = bad;
      if (tagName === 'A') {
        totals.links++;
      }
      else {
        totals.buttons++;
      }
      if (withItems) {
        items.push(compact(bad.outerHTML));
      }
    });
    // Return the result.
    const data = {totals};
    if (withItems) {
      data.items = items;
    }
    return {result: data};
  }, withItems);
};
