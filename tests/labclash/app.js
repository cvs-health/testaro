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
        // Get data on the inputs and select lists.
        const inputs = body.querySelectorAll('input:not([type=hidden]), select');
        const data = [];
        // FUNCTION DEFINITION START
        const debloat = text => text.trim().replace(/\s+/g, ' ');
        // FUNCTION DEFINITION END
        // For each one:
        for (let i = 0; i < inputs.length; i++) {
          // Determine whether it has labeling conflicts.
          let labelTypes = [];
          let texts = [];
          const input = inputs.item(i);
          if (input.hasAttribute('aria-label')) {
            labelTypes.push('aria-label');
            texts = [input.getAttribute('aria-label')];
          }
          if (input.hasAttribute('aria-labelledby')) {
            labelTypes.push('aria-labelledby');
            const labelerIDs = input.getAttribute('aria-labelledby').split(/\s+/);
            const labelerTexts = labelerIDs
            .map(id => {
              const labeler = document.getElementById(id);
              if (labeler) {
                return labeler.textContent;
              }
              else {
                return '';
              }
            })
            .filter(text => text);
            if (labelerTexts.length) {
              texts.push(...labelerTexts);
            }
          }
          const labels = Array.from(input.labels);
          if (labels.length) {
            labelTypes.push('label');
            const labelTexts = labels.map(label => label.textContent).filter(text => text);
            texts.push(...labelTexts);
          }
          // If so:
          if (labelTypes.length > 1) {
            // Compile its data.
            const itemData = {
              type: input.type,
              labelTypes,
              text: debloat(texts.join('; '))
            };
            // Add its data to the report data.
            data.push(itemData);
          }
        }
        return data;
      });
      // Render and serve a report.
      query.report = inputData.length
        ? JSON.stringify(inputData, null, 2)
        : '<strong>None</strong>';
      globals.render('labclash', true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
