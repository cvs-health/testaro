// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    (async () => {
      const ui = await chromium.launch();
      const page = await ui.newPage();
      await page.goto(query.url);
      // Get an array of ElementHandles for decorative images.
      const elements = await page.$$('img[alt=""][src]:not([src=""]):visible');
      const urls = [];
      const listItems = [];
      let done = 0;
      // If any exist:
      if (elements.length) {
        // For each ElementHandle, in parallel in random order:
        elements.forEach(async (element, index) => {
          // Add the element’s URL, if any, and parent data to the array of URLs.
          const url = await element.getAttribute('src');
          const parentJSHandle = await element.getProperty('parentElement');
          const parentTypeJSHandle = await parentJSHandle.getProperty('tagName');
          const parentTextJSHandle = await parentJSHandle.getProperty('textContent');
          const parentType = await parentTypeJSHandle.jsonValue();
          const parentText = await parentTextJSHandle.jsonValue();
          urls[index] = [url, parentType.toLowerCase(), parentText];
          // If this element is the last one processed:
          if (++done === elements.length) {
            // Compile the list items in DOM order.
            for (let i = 1; i <= done; i++) {
              const data = urls[i - 1];
              listItems.push(
                `<li><img alt="image ${i}" src="${data[0]}"><br>${data[1]}: ${data[2]}</li>`
              );
            }
            // Convert the list items to a string.
            query.listItems = listItems.join('\n            ');
            // Render and serve a report.
            globals.render('imgdec', true);
          }
        });
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
