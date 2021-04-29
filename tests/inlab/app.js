// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const debug = false;
    const {chromium} = require('playwright');
    const {injectAxe, getViolations} = require('axe-playwright');
    (async () => {
      // Identify a Browser.
      const ui = await chromium.launch();
      // Identify a Page (tab).
      const page = await ui.newPage();
      // If debugging is on, output page-script console-log messages.
      if (debug){
        page.on('console', msg => {
          if (msg.type() === 'log') {
            console.log(msg.text());
          }
        });
      }
      // Navigate to the specified URL.
      await page.goto(query.url);
      // Inject axe-core into the page.
      await injectAxe(page);
      // Get the violations of the axe-core labels rule.
      const axeReport = await getViolations(page, null, {
        axeOptions: {
          runOnly: ['label']
        }
      });
      // If there are any:
      if (axeReport.length) {
        query.axeReport = JSON
        .stringify(axeReport, null, 2)
        .replace(/</g, '&lt;');
      }
      // Otherwise, i.e. if there are no axe-core violations:
      else {
        // Compile an axe-core report.
        query.axeReport = 'NONE';
      }
      // Get data on the non-hidden inputs and their labels.
      const inputData = await page.$eval('body', body => {
        const inputs = body.querySelectorAll('input:not([type=hidden])');
        const data = [];
        for (let i = 0; i < inputs.length; i++) {
          const item = {};
          const input = inputs.item(i);
          item.type = input.type;
          const ariaLabel = input.getAttribute('aria-label');
          if (ariaLabel) {
            const trimmedLabel = ariaLabel.trim();
            if (trimmedLabel) {
              item.ariaLabel = trimmedLabel;
            }
          }
          const labelNodeList = input.labels;
          if (labelNodeList.length) {
            const labels = Array.from(labelNodeList);
            const labelTexts = labels
            .map(el => el.textContent && el.textContent.trim().replace(/\s+/g, ' '))
            .filter(text => text);
            if (labelTexts.length) {
              item.labels = labelTexts;
            }
          }
          data.push(item);
        }
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
