/*
  nonTable
  Derived from the bbc-a11y useTablesForData test. Crude heuristics omitted.
  This test reports tables used for layout.
*/
exports.reporter = async (page, withItems) => {
  // Identify the visible links without href attributes.
  const badTableTexts = await page.$$eval('table', tables => {
    const badTableTexts = [];
    // FUNCTION DEFINITIONS START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
    const addBad = table => {
      badTableTexts.push(compact(table.outerHTML).slice(0, 100));
    };
    // FUNCTION DEFINITIONS END
    tables.forEach(table => {
      const role = table.getAttribute('role');
      if (
        table.caption
        || ['grid', 'treegrid'].includes(role)
        || table.querySelector('col, colgroup, tfoot, thead, th')
      ) {
        return;
      }
      else if (table.querySelector('table')) {
        addBad(table);
        return;
      }
      else if (
        table.querySelectorAll('tr').length === 1
        || Math.max(
          ... Array
          .from(table.querySelectorAll('tr'))
          .map(row => Array.from(row.querySelectorAll('td')).length)
        ) === 1
      ) {
        addBad(table);
        return;
      }
      else if (table.querySelector('object, embed, applet, audio, video')) {
        addBad(table);
        return;
      }
    });
    return badTableTexts;
  });
  const data = {
    totals: badTableTexts.length
  };
  if (withItems) {
    data.items = badTableTexts;
  }
  return {result: data};
};
