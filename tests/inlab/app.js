// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const debug = false;
    const {chromium} = require('playwright');
    const {injectAxe, getViolations} = require('axe-playwright');
    (async () => {
      // Identify a Browser.
      const ui = await chromium.launch({
        headless: ! debug,
        devtools: debug
      });
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
      // Get the data on the elements violating the axe-core label rule.
      const axeReport = await getViolations(page, null, {
        axeOptions: {
          runOnly: ['label']
        }
      });
      // If there are any:
      if (axeReport.length && axeReport[0].nodes && axeReport[0].nodes.length) {
        const axeNodes = [];
        // FUNCTION DEFINITION START
        const compact = (node, data, logic) => {
          if (node[logic] && node[logic].length) {
            data[logic] = node[logic].map(rule => {
              const item = {};
              item.id = rule.id;
              item.impact = rule.impact;
              item.message = rule.message;
              return item;
            });
          }
        };
        // FUNCTION DEFINITION END
        // For each such element:
        axeReport[0].nodes.forEach(node => {
          // Compact its axe-core report data.
          const data = {};
          compact(node, data, 'any');
          compact(node, data, 'none');
          if (node.target && node.target.length) {
            data.selector = node.target[0];
          }
          if (data.any || data.none) {
            axeNodes.push(data);
          }
        });
        query.axeReport = JSON.stringify(axeNodes, null, 2).replace(/</g, '&lt;');
      }
      // Otherwise, i.e. if there are no axe-core violations:
      else {
        // Compile an axe-core report.
        query.axeReport = 'NONE';
      }
      // Get data on the non-hidden inputs and their labels.
      const inputData = await page.$eval('body', body => {
        const fieldSets = Array.from(body.getElementsByTagName('fieldset'));
        const fieldSetMap = new Map();
        fieldSets.forEach(fieldSet => {
          const legend = fieldSet.firstElementChild;
          if (legend && legend.tagName === 'LEGEND') {
            const legendText = legend.textContent;
            if (legendText) {
              const inputs = Array.from(fieldSet.getElementsByTagName('input'));
              inputs.forEach(input => {
                if (fieldSetMap.has(input)) {
                  fieldSetMap.set(input, `${fieldSetMap.get(input)}; ${legendText}`);
                }
                else {
                  fieldSetMap.set(input, legendText);
                }
              });
            }
          }
        });
        const inputs = body.querySelectorAll('input:not([type=hidden])');
        const data = [];
        // FUNCTION DEFINITION START
        const debloat = text => text.trim().replace(/\s+/g, ' ');
        // FUNCTION DEFINITION END
        // For each non-hidden input:
        for (let i = 0; i < inputs.length; i++) {
          const item = {};
          const input = inputs.item(i);
          // Type.
          item.type = input.type;
          // Fieldset legend, if any.
          if (fieldSetMap.has(input)) {
            item.legend = debloat(fieldSetMap.get(input));
          }
          // Label in an aria-label attribute, if any.
          const ariaLabel = input.getAttribute('aria-label');
          if (ariaLabel) {
            const trimmedLabel = debloat(ariaLabel);
            if (trimmedLabel) {
              item.ariaLabel = trimmedLabel;
            }
          }
          // Explicit and implicit label elements, if any.
          const labelNodeList = input.labels;
          if (labelNodeList.length) {
            const labels = Array.from(labelNodeList);
            const labelTexts = labels
            .map(el => el.textContent && debloat(el.textContent))
            .filter(text => text);
            if (labelTexts.length) {
              item.labels = labelTexts;
            }
          }
          // Elements referenced by aria-labelledby attribute, if any.
          if (input.hasAttribute('aria-labelledby')) {
            const labelerIDs = input.getAttribute('aria-labelledby').split(/\s+/);
            labelerIDs.forEach(id => {
              const labeler = document.getElementById(id);
              if (labeler) {
                if (item.labelers) {
                  item.labelers.push(debloat(labeler.textContent));
                }
                else {
                  item.labelers = [debloat(labeler.textContent)];
                }
              }
            });
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
