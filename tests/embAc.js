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
        items.push({
          embeddedPair: bad,
          excerpt: compact(bad.outerHTML)
        });
      }
    });
    // Return the result.
    const data = {totals};
    const standardInstances = [];
    if (withItems) {
      data.items = items;
      items.forEach(item => {
        const pair = item.embeddedPair.split(' ');
        standardInstances.push({
          issueID: `embAc-${pair[0]}-${pair[1]}`,
          what: `Element ${pair[0]} contains element ${pair[1]}`,
          ordinalSeverity: 0,
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: item.excerpt
        });
      });
    }
    return {
      data,
      totals: Object.values(data.totals).reduce((sum, current) => sum + current),
      standardInstances
    };
  }, withItems
);
