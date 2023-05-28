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
      let container;
      if (withItems) {
        if (['A', 'BUTTON'].includes(bad.parentElement.tagName)) {
          container = bad.parentElement;
        }
        else {
          container = bad.parentElement.parentElement;
        }
        items.push({
          embeddedElement: bad.tagName,
          excerpt: compact(container.outerHTML)
        });
      }
    });
    // Return the result.
    const data = {totals};
    const standardInstances = [];
    const total = Object.values(data.totals).reduce((sum, current) => sum + current);
    if (withItems) {
      data.items = items;
      items.forEach(item => {
        standardInstances.push({
          issueID: `embAc-${item.embeddedElement}`,
          what: `Element ${item.embeddedElement} is embedded in a link or button`,
          ordinalSeverity: 2,
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: item.excerpt
        });
      });
    }
    else if (total) {
      standardInstances.push({
        issueID: 'embAc',
        what: 'Interactive elements are contained by links or buttons',
        ordinalSeverity: 2,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      });
    }
    return {
      data,
      totals: [0, 0, total, 0],
      standardInstances
    };
  }, withItems
);
