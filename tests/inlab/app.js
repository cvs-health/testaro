// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    const {injectAxe, getViolations} = require('axe-playwright');
    (async () => {
      // Identify a Browser.
      const ui = await chromium.launch();
      // Identify a Page (tab).
      const page = await ui.newPage();
      // Navigate to the specified URL.
      await page.goto(query.url);
      // Inject axe-core into the page.
      await injectAxe(page);
      // Get the violations of the axe-core labels rule.
      const axeReport = await getViolations(page, null, {
        axeOptions: {
          runOnly: ['labels']
        }
      });
      // If there are any:
      if (axeReport.length) {
        query.axeReport = JSON.stringify(axeReport, null, 2).replace(/</g, '&lt;');
      }
      // Otherwise, i.e. if there are no axe-core violations:
      else {
        // Compile an axe-core report.
        query.axeReport = 'NONE';
      }
      // Get data on the inputs and their labels.
      const inputData = await page.evaluate('body', body => {
        const inputs = body.getElementsByTagName('input');
        const data = [];
        for (let i = 0; i < inputs.length; i++) {
          const item = {};
          const input = inputs.item(i);
          item.type = input.type;
          const ariaLabel = input.getAttribute('aria-label');
          if (ariaLabel) {
            item.ariaLabel = ariaLabel;
          }
          const labels = Array.from(input.labels);
          if (labels.length) {
            item.labels = labels.map(el => el.textContent).filter(text => text);
          }
          data.push(item);
        };
        return data;
      });
      // Render and serve a report.
      query.report = inputData.length ? JSON.stringify(inputData, null, 2) : 'NONE';
      globals.render('inlab', true);
      ui.close();
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
