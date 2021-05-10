// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['actFileOrURL'])) {
    const debug = false;
    (async () => {
      // Perform the specified preparations.
      const page = await globals.perform(debug);
      // Get an array of ElementHandles for elements with role attributes.
      const elements = await page.$$('[role]');
      const tally = {};
      let done = 0;
      // If any exist:
      if (elements.length) {
        // For each of the elements, in parallel and in random order:
        elements.forEach(async element => {
          // Get its type.
          const tagHandle = await element.getProperty('tagName');
          const ucTag = await tagHandle.jsonValue();
          const tag = ucTag.toLowerCase();
          // Get its explicit role.
          const role = await element.getAttribute('role');
          // Add the element to the tabulation.
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
          // If the element is the last one processed:
          if (++done === elements.length) {
            // Render and serve a report.
            query.tally = JSON.stringify(tally, null, 2);
            globals.render('roles', true);
          }
        });
      }
      // Otherwise, i.e. if no elements with role attributes exist:
      else {
        // Render and serve a report.
        query.tally = 'NONE';
        globals.render('roles', true);
      }
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
