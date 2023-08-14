/*
  embAc
  This test reports interactive elements (links, buttons, inputs, and select lists)
  contained by links or buttons. Such embedding not only violates the HTML standard,
  but also complicates user interaction and creates risks of error. It becomes
  non-obvious what a user will activate with a click.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(
    page, 'a a, a button, a input, a select, button a, button button, button input, button select'
  );
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its embedder is a link or a button.
    const embedderTagName = await loc.evaluate(element => {
      const embedder = element.parentElement.closest('a, button');
      return embedder ? embedder.tagName : '';
    });
    let param = 'a link or button';
    if (embedderTagName === 'A') {
      param = 'a link';
    }
    else if (embedderTagName === 'BUTTON') {
      param = 'a button';
    }
    all.locs.push([loc, param]);
  }
  // Populate and return the result.
  const whats = [
    'Interactive element is embedded in __param__',
    'Interactive elements are contained by links or buttons'
  ];
  return await report(withItems, all, 'embAc', whats, 2);
};
