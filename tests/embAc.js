// Reports links and buttons contained by links or buttons.
exports.reporter = async (page, withItems) => {
  return await page.$$('a a, a button, button a, button button', args => {
    const bads = args[0];
    const withItems = args[1];
    // FUNCTION DEFINITION START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
    // FUNCTION DEFINITION END
    const items = [];
    // Total and, if requested, itemize the faulty elements.
    const totals = bads.reduce((tot, current) => {
      const {tagName} = current;
      if (tagName === 'A') {
        tot.links++;
      }
      else {
        tot.buttons++;
      }
      if (withItems) {
        items.push(compact(current.outerHTML));
      }
      return tot;
    }, {
      links: 0,
      buttons: 0
    });
    // Return the result.
    return {result: {totals}};
  }, withItems);
};
