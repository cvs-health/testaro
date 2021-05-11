// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['actFileOrURL'])) {
    const debug = false;
    (async () => {
      // Perform the specified preparations.
      const page = await globals.perform(debug);
      // Compile an axe-core report.
      await globals.axe(page, ['label']);
      // Get data.
      const inputData = await page.$eval('body', body => {
        // Get data on the fieldsets and their legends and inputs.
        const fieldSets = Array.from(body.getElementsByTagName('fieldset'));
        const fieldSetMap = new Map();
        fieldSets.forEach(fieldSet => {
          const legend = fieldSet.firstElementChild;
          if (legend && legend.tagName === 'LEGEND') {
            const legendText = legend.textContent;
            if (legendText) {
              const inputs = Array.from(fieldSet.querySelectorAll('input, select'));
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
        // Get data on the inputs and select lists.
        const inputs = body.querySelectorAll('input:not([type=hidden]), select');
        const data = [];
        // FUNCTION DEFINITION START
        const debloat = text => text.trim().replace(/\s+/g, ' ');
        // FUNCTION DEFINITION END
        // For each one:
        for (let i = 0; i < inputs.length; i++) {
          // Initialize an object of data about it.
          const item = {};
          const input = inputs.item(i);
          // Add its type.
          item.type = input.type;
          // Add its fieldset legend, if any.
          if (fieldSetMap.has(input)) {
            item.legend = debloat(fieldSetMap.get(input));
          }
          // Add its aria-label attribute, if any.
          const ariaLabel = input.getAttribute('aria-label');
          if (ariaLabel) {
            const trimmedLabel = debloat(ariaLabel);
            if (trimmedLabel) {
              item.ariaLabel = trimmedLabel;
            }
          }
          // Add its explicit and implicit label elements’ texts, if any.
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
          // Add its referenced labels’ texts, if any.
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
          // Add its data to the report data.
          data.push(item);
        }
        return data;
      });
      // Render and serve a report.
      query.report = inputData.length ? JSON.stringify(inputData, null, 2) : '<strong>None</strong>';
      globals.render('inlab', true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
