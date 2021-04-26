// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    (async () => {
      const ui = await chromium.launch();
      const page = await ui.newPage();
      await page.goto(query.url);
      // Get an array of ElementHandles for informative images.
      const elements = await page.$$('img[alt]:not([alt=""]):visible');
      const alts = [];
      const listItems = [];
      let done = 0;
      // If any exist:
      if (elements.length) {
        // For each ElementHandle, in parallel in random order:
        elements.forEach(async (element, index) => {
          // Get and record a screen shot of the element.
          await element.screenshot({path: `screenShots/imginf-${index + 1}.png`});
          // Add the text alternative of the element to the array of text alternatives.
          alts[index + 1] = await element.getAttribute('alt');
          // If this element is the last one processed:
          if (++done === elements.length) {
            // Compile the list items in DOM order.
            for (let i = 1; i <= done; i++) {
              listItems.push(
                `<li><img alt="image ${i}" src="/autotest/screenShots/imginf-${i}.png"><br>${alts[i]}</li>`
              );
            }
            // Convert the list items to a string.
            query.listItems = listItems.join('\n            ');
            // Render and serve a report.
            globals.render('imginf', true);
          }
        });
      }
      // Otherwise, i.e. if no informative images exist:
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
