// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    (async () => {
      const ui = await chromium.launch();
      const page = await ui.newPage();
      await page.goto(query.url);
      // Get an array of data on all background images.
      const data = await page.$eval('body', body => {
        const elements = Array.from(body.querySelectorAll('*'));
        const bgData = elements.map(element => {
          const bgStyle = window.getComputedStyle(element).getPropertyValue('background-image');
          if (bgStyle && bgStyle !== 'none') {
            return [bgStyle.slice(4, -1), element.tagName.toLowerCase(), element.textContent];
          }
          else {
            return [];
          }
        });
        const usableData = bgData.filter(item => item.length);
        return usableData;
      });
      // If any background images exist:
      console.log(`data length is ${data.length}`);
      if (data.length) {
        // Compile the list items.
        const listItems = data.map(
          item => `<li><img src=${item[0]}><br>${item[1]}: ${item[2]}</li>`
        );
        // Convert the list items to a string.
        query.listItems = listItems.join('\n            ');
        // Render and serve a report.
        globals.render('imgbg', true);
      }
      // Otherwise, i.e. if no background images exist:
      else {
        // Render and serve a report.
        query.listItems = '<li>NONE</li>';
        globals.render('imgbg', true);
      }
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
