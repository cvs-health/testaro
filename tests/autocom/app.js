// Compiles a report.
exports.reporter = async page => await page.$eval('body', body => {
  // Get an array of autocomplete-eligible inputs.
  const inputTypes = ['date', 'email', 'password', 'tel', 'text', 'url'];
  const selectors = inputTypes.map(type => `input[type=${type}]`);
  const elements = Array.from(body.querySelectorAll(selectors.join(', ')));
  // Return a corresponding array of report objects. For each of them:
  return elements.map((el, index) => {
    // Limit the length of displayed labels.
    const labelTextMax = 100;
    // Get an array of the text contents of its label elements, if any.
    const labelTexts = Array.from(el.labels).map(label => label.textContent);
    // Add the text contents of its referenced labels, if any.
    if (el.hasAttribute('aria-labelledby')) {
      const byIDs = el.getAttribute('aria-labelledby').split(/\s+/);
      labelTexts.push(...byIDs.map(id => document.getElementById(id).textContent));
    }
    // Add the value of its aria-label attribute, if any.
    if (el.hasAttribute('aria-label')) {
      labelTexts.push(el.getAttribute('aria-label'));
    }
    // Get a length-limited concatenation of the label texts.
    const labelText = labelTexts.join('; ')
    .replace(/[<>]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, labelTextMax);
    // Return the report object.
    return {
      index,
      type: el.type || 'text',
      autocomplete: el.getAttribute('autocomplete') || '<strong>None</strong>',
      labelText
    };
  });
});
// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['actFileOrURL'])) {
    const debug = false;
    (async () => {
      // Perform the specified preparations.
      const page = await globals.perform(debug);
      // Compile an axe-core report.
      await globals.axe(page, ['autocomplete-valid']);
      // Compile an autocomplete report.
      const report = await exports.reporter(page);
      query.report = JSON.stringify(report, null, 2);
      // Render and serve a report.
      globals.render('autocom', true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
