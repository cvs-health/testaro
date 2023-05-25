/*
  nonTable
  Derived from the bbc-a11y useTablesForData test. Crude heuristics omitted.
  This test reports tables used for layout.
*/
exports.reporter = async (page, withItems) => {
  // Identify the tables used for layout.
  const badTableTexts = await page.$$eval('table', tables => {
    // Initialize an array of pseudotable texts.
    const badTableTexts = [];
    // FUNCTION DEFINITIONS START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
    // Adds the first 100 characters of the code of a pseudotable to the array of pseudotable texts.
    const addBad = table => {
      badTableTexts.push(compact(table.outerHTML).slice(0, 100));
    };
    // FUNCTION DEFINITIONS END
    // For each table on the page:
    tables.forEach(table => {
      // Ignore it if it has a grid or treegrid role, a caption, or a table-like element.
      const role = table.getAttribute('role');
      if (
        table.caption
        || ['grid', 'treegrid'].includes(role)
        || table.querySelector('col, colgroup, tfoot, thead, th')
      ) {
        return;
      }
      // Otherwise, if the table contains another table:
      else if (table.querySelector('table')) {
        // Treat it as a pseudotable.
        addBad(table);
        return;
      }
      // Otherwise, if the table has only 1 row or 1 column:
      else if (
        table.querySelectorAll('tr').length === 1
        || Math.max(
          ... Array
          .from(table.querySelectorAll('tr'))
          .map(row => Array.from(row.querySelectorAll('td')).length)
        ) === 1
      ) {
        // Treat it as a pseudotable.
        addBad(table);
        return;
      }
      // Otherwise, if the table contains an object or player:
      else if (table.querySelector('object, embed, applet, audio, video')) {
        // Treat it as a pseudotable.
        addBad(table);
        return;
      }
    });
    // Return the array of pseudotable text beginnings.
    return badTableTexts;
  });
  // Return the result.
  const data = {
    total: badTableTexts.length
  };
  const standardInstances = [];
  if (withItems) {
    data.items = badTableTexts;
    data.items.forEach(text => {
      standardInstances.push({
        issueID: 'nonTable',
        what: 'Table is misused to arrange content',
        ordinalSeverity: 0,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: text
      });
    });
  }
  return {
    data,
    totals: [data.total],
    standardInstances
  };
};
