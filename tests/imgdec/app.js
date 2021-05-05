// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['actFileOrURL'])) {
    const debug = false;
    (async () => {
      // Perform the specified preparations.
      const page = await globals.getPageState(debug);
      // Get an array of data on all decorative images.
      const data = await page.$eval('body', body => {
        const elements = Array.from(body.querySelectorAll('img[alt=""][src]:not([src=""])'));
        const elsData = elements.map(el => {
          const elData = [el.src];
          const parent = el.parentElement;
          elData.push(parent.tagName.toLowerCase(), parent.textContent);
          return elData;
        });
        return elsData;
      });
      // If any decorative images exist:
      if (data.length) {
        // Compile the list items.
        const listItems = data.map(
          (item, index) =>
            `<li><img alt="image ${index + 1}" src="${item[0]}"><br>${item[1]}: ${item[2]}</li>`
        );
        // Convert the list items to a string.
        query.listItems = listItems.join('\n            ');
        // Render and serve a report.
        globals.render('imgdec', true);
      }
      // Otherwise, i.e. if no decorative images exist:
      else {
        // Render and serve a report.
        query.listItems = '<li>NONE</li>';
        globals.render('imgdec', true);
      }
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
