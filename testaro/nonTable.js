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
  const all = await init(page, 'body *');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element violates the rule.
    const isBad = await loc.evaluate(el => {
      const isViolator = el.tagName.length > 300;
      return isViolator;
    });
    // If it does:
    if (isBad) {
      // Add the locator to the array of violators.
      all.locs.push(loc);
    }
  }
  // Populate and return the result.
  const whats = ['Itemized description', 'Summary description'];
  return await report(withItems, all, 'ruleID', whats, 0);
};


// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for the table elements.
  const locAll = page.locator('table');
  const locs = await locAll.all();
  // For each of them:
  for (const loc of locs) {
    // Get whether the table is misused.
    const isBad = await loc.evaluate(element => {
      const role = element.getAttribute('role');
      // If it contains another table:
      if (element.querySelector('table')) {
        // Return misuse.
        return true;
      }
      // Otherwise, if it has only 1 column or 1 row:
      else if (
        element.querySelectorAll('tr').length === 1
        || Math.max(
          ... Array
          .from(element.querySelectorAll('tr'))
          .map(row => Array.from(row.querySelectorAll('th, td')).length)
        ) === 1
      ) {
        // Return misuse.
        return true;
      }
      // Otherwise, if it contains an object or player:
      else if (element.querySelector('object, embed, applet, audio, video')) {
        // Return misuse.
        return true;
      }
      // Otherwise, if it contains a table-compatible element:
      else if (
        element.caption
        || ['grid', 'treegrid'].includes(role)
        || element.querySelector('col, colgroup, tfoot, thead, th')
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
    // If it is misused:
    if (isBad) {
      // Add to the totals.
      totals[2]++;
      // If itemization is required:
      if (withItems) {
        // Get data on the table.
        const elData = await getLocatorData(loc);
        // Add an instance to the result.
        standardInstances.push({
          ruleID: 'nonTable',
          what: 'Table is misused to arrange content',
          ordinalSeverity: 2,
          tagName: 'TABLE',
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
  }
  // If itemization is not required:
  if (! withItems) {
    standardInstances.push({
      ruleID: 'nonTable',
      what: 'Tables are misused to arrange content',
      count: totals[2],
      ordinalSeverity: 2,
      tagName: 'TABLE',
      id: '',
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
    totals,
    standardInstances
  };
};
