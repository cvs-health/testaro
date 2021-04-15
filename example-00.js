// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url', 'elementType', 'elementIndex', 'state'])) {
    query.State = query.state === 'focus' ? 'Focused' : 'Hovered';
    const {chromium, firefox, webkit} = require('playwright');
    const shoot = async agent => {
      const ui = await agent.launch();
      const page = await ui.newPage();
      await page.goto(query.url);
      const element = await page.$(`:nth-match(${query.elementType}, ${query.elementIndex})`);
      let elementBox = await element.boundingBox();
      const shotBox = {
        x: elementBox.x - 10,
        y: elementBox.y - 10,
        width: elementBox.width + 20,
        height: elementBox.height + 20
      };
      await page.screenshot({
        clip: shotBox,
        path: `screenShots/example-00-off-${agent.name()}.png`
      });
      await query.state === 'focus' ? element.focus() : element.hover();
      await page.screenshot({
        clip: shotBox,
        path: `screenShots/example-00-on-${agent.name()}.png`
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
