// Handles a form submission.
exports.formHandler = globals => {
  // Add the manager username and computed email to the query.
  const {query} = globals;
  if (globals.queryIncludes(['url', 'elementType', 'elementIndex'])) {
    const {chromium, firefox, webkit} = require('playwright');
    const shoot = async agent => {
      const ui = await agent.launch();
      const page = await ui.newPage();
      await page.goto(query.url);
      const element = await page.$(`:nth-match(${query.elementType}, ${query.elementIndex})`);
      const elementBox = await element.boundingBox();
      const shotBox = {
        x: elementBox.x - 10,
        y: elementBox.y - 10,
        width: elementBox.width + 20,
        height: elementBox.height + 20
      };
      await page.screenshot({
        clip: shotBox,
        path: `screenShots/example-00-blur-${agent.name()}.png`
      });
      await element.focus();
      await page.screenshot({
        clip: shotBox,
        path: `screenShots/example-00-focus-${agent.name()}.png`
      });
      await ui.close();
    };
    (async () => {
      await shoot(chromium);
      await shoot(firefox);
      await shoot(webkit);
      // Replace the placeholders and serve the step-2 view.
      globals.render('example-00-out', true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
