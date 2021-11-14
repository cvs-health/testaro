/*
  embAc
  This test reports interactive elements (links, buttons, inputs, and select lists)
  contained by links or buttons. Such embedding not only violates the HTML standard,
  but also complicates user interaction and creates risks of error. It becomes
  non-obvious what a user will activate with a click.
*/
exports.reporter = async (page, withItems) => await page.$$eval(
  'a a, a button, a input, a select, button a, button button, button input, button select',
  (bads, withItems) => {
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
