// Reports links, buttons, and inputs contained by tables.
const cntr = 'table:not([role=grid]):not([role=treegrid])';
exports.reporter = async (page, withItems) => await page.$$eval(
  `${cntr} a, ${cntr} button, ${cntr} input, ${cntr} select`, (bads, withItems) => {
    // FUNCTION DEFINITION START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
    // FUNCTION DEFINITION END
    const totals = {
      links: 0,
      buttons: 0,
      inputs: 0,
      selects: 0
    };
    const items = [];
    // Total and, if requested, itemize the faulty elements.
    bads.forEach(bad => {
      totals[Object.keys(totals)[['A', 'BUTTON', 'INPUT', 'SELECT'].indexOf(bad.tagName)]]++;
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
  }, withItems
);
