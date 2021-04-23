// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    (async () => {
      const ui = await chromium.launch();
      const page = await ui.newPage();
      await page.goto(query.url);
      // Get an array of ElementHandles for elements with explicit role attributes.
      const elements = await page.$$('[role]');
      const tally = {};
      let done = 0;
      // For each of the elements, in parallel and in random order:
      elements.forEach(async element => {
        // Get its type.
        const tagHandle = await element.getProperty('tagName');
        const ucTag = await tagHandle.jsonValue();
        const tag = ucTag.toLowerCase();
        // Get its explicit role.
        const role = await element.getAttribute('role');
        // Add the element to the tabulation.
        if (tally[tag]) {
          if (tally[tag][role]) {
            tally[tag][role]++;
          }
          else {
            tally[tag][role] = 1;
          }
        }
        else {
          tally[tag] = {
            [role]: 1
          };
        }
        // If the element is the last one processed:
        if (++done === elements.length) {
          // Output the report.
          query.tally = JSON.stringify(tally, null, 2);
          globals.render('example-02-out', true);
        }
      });
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
