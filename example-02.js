// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    (async () => {
      const ui = await chromium.launch();
      const page = await ui.newPage();
      await page.goto(query.url);
      const elements = await page.$$('[role]');
      const tally = {};
      let done = 0;
      elements.forEach(async element => {
        const tagHandle = await element.getProperty('tagName');
        const ucTag = await tagHandle.jsonValue();
        const tag = ucTag.toLowerCase();
        const role = await element.getAttribute('role');
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
        if (++done === elements.length) {
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
