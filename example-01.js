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
      const tally = [];
      elements.forEach(async element => {
        const tagHandle = await element.getProperty('tagName');
        const tag = await tagHandle.jsonValue();
        const role = await element.getAttribute('role');
        tally.push([tag, role]);
        if (tally.length === elements.length) {
          let list = [];
          tally.forEach(item => {
            list.push(`<li>Element ${item[0].toLowerCase()} has role ${item[1]}</li>`);
          });
          query.tally = list.join('\n            ');
          globals.render('example-01-out', true);
        }
      });
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
