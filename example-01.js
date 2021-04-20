// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    (async () => {
      // Identify a Browser.
      const ui = await chromium.launch();
      // Identify a Page (tab).
      const page = await ui.newPage();
      // Navigate to the specified URL.
      await page.goto(query.url);
      // Identify an array of the ElementHandles of elements with role attributes.
      const elements = await page.$$('[role]');
      const list = [];
      // For each ElementHandle:
      elements.forEach(async element => {
        // Identify a JSHandle for its type.
        const tagHandle = await element.getProperty('tagName');
        // Identify the upper-case name of the type.
        const ucTag = await tagHandle.jsonValue();
        // Identify its conversion to lower case.
        const tag = ucTag.toLowerCase();
        // Identify the value of its role attribute.
        const role = await element.getAttribute('role');
        // Add the type and role to the list.
        list.push([tag, role]);
        // When all matching elements have been processed:
        if (list.length === elements.length) {
          // Populate an array of HTML list elements.
          const htmlList = [];
          list.forEach(item => {
            htmlList.push(`<li>Element ${item[0]} has role ${item[1]}.</li>`);
          });
          // Concatenate the array elements.
          query.report = htmlList.join('\n            ');
          // Render and serve a report.
          globals.render('example-01-out', true);
          ui.close();
        }
      });
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
