/*
  nonTable
  Derived from the bbc-a11y useTablesForData test. Crude heuristics omitted.
  This test reports tables used for layout.
*/

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'table');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element violates the rule.
    const isBad = await loc.evaluate(el => {
      const role = el.getAttribute('role');
      // If it contains another table:
      if (el.querySelector('table')) {
        // Return misuse.
        return true;
      }
      // Otherwise, if it has only 1 column or 1 row:
      else if (
        el.querySelectorAll('tr').length === 1
        || Math.max(
          ... Array
          .from(el.querySelectorAll('tr'))
          .map(row => Array.from(row.querySelectorAll('th, td')).length)
        ) === 1
      ) {
        // Return misuse.
        return true;
      }
      // Otherwise, if it contains an object or player:
      else if (el.querySelector('object, embed, applet, audio, video')) {
        // Return misuse.
        return true;
      }
      // Otherwise, if it contains a table-compatible element:
      else if (
        el.caption
        || ['grid', 'treegrid'].includes(role)
        || el.querySelector('col, colgroup, tfoot, thead, th')
      ) {
        // Return validity.
        return false;
      }
      // Otherwise:
      else {
        // Return misuse.
        return true;
      }
    });
    // If it does:
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push(loc);
    }
  }
  // Populate and return the result.
  const whats = ['Table is misused to arrange content', 'Tables are misused to arrange content'];
  return await report(withItems, all, 'nonTable', whats, 2, 'TABLE');
};
