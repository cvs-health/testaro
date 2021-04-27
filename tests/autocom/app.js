// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    (async () => {
      const labelTextMax = 100;
      const ui = await chromium.launch();
      const page = await ui.newPage();
      await page.goto(query.url);
      const inputTypes = ['date', 'email', 'password', 'tel', 'text', 'url'];
      const selectors = inputTypes.map(type => `input[type=${type}]`);
      // Get an array of ElementHandles for autocomplete-eligible inputs.
      const elements = await page.$$(selectors.join(', '));
      const tally = [];
      let done = 0;
      // If there are any:
      if (elements.length) {
        // For each ElementHandle, in parallel in random order:
        elements.forEach(async (element, index) => {
          // Get a concatenation of the text contents of its associated label elements.
          const labelText = await element.evaluate(
            (el, max) => {
              const labelTexts = Array.from(el.labels).map(label => label.textContent);
              if (el.hasAttribute('aria-labelledby')) {
                const byIDs = el.getAttribute('aria-labelledby').split(' ');
                labelTexts.push(byIDs.map(id => document.getElementById(id).textContent));
              }
              if (el.hasAttribute('aria-label')) {
                labelTexts.push(el.getAttribute('aria-label'));
              }
              return labelTexts.join('; ')
              .replace(/[<>]/g, '')
              .replace(/\s{2,}/g, ' ')
              .slice(0, max);
            },
            labelTextMax
          );
          // Get other properties of the element.
          const typeHandle = await element.getProperty('type');
          const type = await typeHandle.jsonValue() || 'text';
          const acHandle = await element.getAttribute('autocomplete') || '';
          const autocomplete = acHandle || 'NONE';
          // Add the element to the result array.
          tally.push({
            index,
            type,
            autocomplete,
            labelText
          });
          // If this element is the last one processed:
          if (++done === elements.length) {
            // Sort the tabulation by DOM order.
            tally.sort((a, b) => a.index - b.index);
            // Convert the tabulation to JSON.
            query.tally = JSON.stringify(tally, null, 2);
            // Render and serve a report.
            globals.render('autocom', true);
          }
        });
      }
      // Otherwise, i.e. if there are no autocomplete-eligible inputs:
      else {
        // Render and serve a report.
        query.tally = 'NONE';
        globals.render('autocom', true);
      }
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
