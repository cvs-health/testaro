// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url', 'elementType', 'elementIndex', 'state'])) {
    query.State = query.state === 'focus' ? 'Focused' : 'Hovered';
    const {chromium, firefox, webkit} = require('playwright');
    const boxes = {
      off: {},
      on: {}
    };
    // FUNCTION DEFINITIONS START
    // Return a semple of the text content of an element.
    const textSample = async (element, max) => {
      const textContent = await element.textContent();
      return textContent.length > max ? `${textContent.slice(0, max)}&hellip;` : textContent;
    };
    // Returns the bounding box of an element.
    const realBox = async (minWidth, minHeight, element) => {
      const ownBox = await element.boundingBox();
      console.log(`ownBox is ${JSON.stringify(ownBox, null, 2)}`);
      if (ownBox.width >= minWidth && ownBox.height >= minHeight) {
        return ownBox;
      }
      else {
        const parentElement = await element.getProperty('parentElement');
        const parentBox = await parentElement.boundingBox();
        console.log(`parentBox is ${JSON.stringify(parentBox, null, 2)}`);
        return parentBox;
      }
    };
    // Returns a clipping object for a screenshot with a margin around a bounding box.
    const shotBox = (margin, realBox) => {
      const marginLeft = Math.min(margin, realBox.x);
      const marginTop = Math.min(margin, realBox.y);
      return {
        x: realBox.x - marginLeft,
        y: realBox.y - marginTop,
        width: realBox.width + marginLeft + margin,
        height: realBox.height + marginTop + margin
      };
    };
    // Creates and records a screen shot.
    const shoot = async (page, element, hasState, agent) => {
      if (! globals.response.writableEnded) {
        // If specified, change the element state.
        await hasState ? element[query.state]() : Promise.resolve('');
        // Identify the bounding box of the element.
        let elementBox = await realBox(10, 10, element);
        const text = await textSample(element, 40);
        // If it has one:
        if (elementBox) {
          // If the origin of the bounding box is above or to the left of the page:
          if (
            elementBox.x < 0
            || elementBox.y < 0
            // || elementBox.x + elementBox.width > page.viewportSize().width
            // || elementBox.y + elementBox.height > page.viewportSize().height
          ) {
            // Report the error.
            globals.serveMessage(
              `
                ERROR: <code>&lt;${query.elementType}&gt;</code> number ${query.elementIndex}
                (${text}) above or left of page.
              `,
              globals.response
            );
          }
          // Otherwise, if the bounding box is 0 or 1 pixel in either dimension:
          else if (elementBox.width < 2 || elementBox.height < 2) {
            // Report the error.
            globals.serveMessage(
              `
                ERROR: Size of <code>&lt;${query.elementType}&gt;</code>
                number ${query.elementIndex} (${text})
                is ${elementBox.width} &times; ${elementBox.height}.
              `,
              globals.response
            );
          }
          // Otherwise, i.e. if the bounding box is valid:
          else {
            const toggle = hasState ? 'on' : 'off';
            // Record it.
            boxes[toggle][agent.name()] = elementBox;
            // Make and report a screen shot of it.
            await page.screenshot({
              clip: shotBox(10, elementBox),
              fullPage: true,
              path: `screenShots/example-00-${toggle}-${agent.name()}.png`
            });
          }
        }
        // Otherwise, i.e. if the element has no bounding box:
        else {
          globals.serveMessage(
            `
              ERROR: Location of <code>&lt;${query.elementType}&gt;</code> number
              ${query.elementIndex} (${text}) undefined.
            `,
            globals.response
          );
        }
      }
    };
    // Creates and records 2 screen shots in a browser.
    const shootBoth = async agent => {
      // Launch the specified browser.
      const ui = await agent.launch();
      // Open an empty window.
      const page = await ui.newPage();
      // Visit the specified page.
      await page.goto(query.url);
      // Identify the specified element.
      const element = await page.$(`:nth-match(${query.elementType}, ${query.elementIndex})`);
      // If the specified element exists on the specified page:
      if (element) {
        // Make 2 screen shots of it.

        console.log(agent.name());
        await shoot(page, element, false, agent);
        await shoot(page, element, true, agent);
        ui.close();
      }
      // Otherwise, i.e. if the element does not exist:
      else {
        // Serve an error message.
        globals.serveMessage(
          `
            ERROR: No <code>&lt;${query.elementType}&gt;</code> number ${query.elementIndex}
            at ${query.url}.
          `, globals.response
        );
      }
    };
    // FUNCTION DEFINITIONS END
    (async () => {
      // Make the screen shots.
      await shootBoth(chromium);
      await shootBoth(firefox);
      await shootBoth(webkit);
      // Report the bounding-box data.
      query.boxData = JSON.stringify(boxes, null, 2);
      // Replace the placeholders and serve the step-2 view.
      globals.render('example-00-out', true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
