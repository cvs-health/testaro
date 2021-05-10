// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['actFileOrURL'])) {
    const debug = false;
    (async () => {
      // Perform the specified preparations.
      const page = await globals.perform(debug);
      // Compile an axe-core report.
      await globals.axe(page, ['image-alt', 'image-redundant-alt']);
      // Get an array of data on all informative images.
      const data = await page.$eval('body', body => {
        const elements = Array.from(
          body.querySelectorAll('img[alt][src]:not([alt=""]):not([src=""])')
        );
        const elsData = elements.map(el => [el.src, el.alt]);
        return elsData;
      });
      // If any informative images exist:
      if (data.length) {
        // Compile the list items.
        const listItems = data.map(
          (item, index) =>
            `<li><img alt="image ${index + 1}" src="${item[0]}"><br>${item[1]}</li>`
        );
        // Convert the list items to a string.
        query.listItems = listItems.join('\n            ');
        // Render and serve a report.
        globals.render('imginf', true);
      }
      // Otherwise, i.e. if no decorative images exist:
      else {
        // Render and serve a report.
        query.listItems = '<li>NONE</li>';
        globals.render('imginf', true);
      }
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
