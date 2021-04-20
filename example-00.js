// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url', 'elementType', 'elementIndex', 'state'])) {
    const minHeight = 10;
    const minWidth = 10;
    query.State = query.state === 'focus' ? 'Focused' : 'Hovered';
    const {chromium, firefox, webkit} = require('playwright');
    const elementBoxJSON = '';
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
    // Rounds the values of the properties of a bounding box.
    const rounded = box => {
      const outBox = {};
      ['x', 'y', 'width', 'height'].forEach(prop => {
        outBox[prop] = Math.round(box[prop]);
      });
      return outBox;
    };
    // Returns the JSON representation of the value of a property of an ElementHandle.
    /*
    const jsonValue = async (element, propertyName) => {
      const jsHandleValue = await element.getProperty(propertyName);
      const jsValue = await jsHandleValue.jsonValue();
      return jsValue;
    };
    // Returns the bounding box of an ElementHandle.
    const boundingBox = async element => {
      const box = {};
      box.x = await jsonValue(element, 'offsetLeft');
      box.y = await jsonValue(element, 'offsetTop');
      box.width = await jsonValue(element, 'offsetWidth');
      box.height = await jsonValue(element, 'offsetHeight');
      return box;
    };
    */
    // Returns the client rectangle of a JSHandle as JSON.
    const boxJSON = async element => {
      const elementBox = await element.evaluate(el => {
        const domRect = el.getBoundingClientRect();
        const objRect = {
          x: domRect.x,
          y: domRect.y,
          width: domRect.width,
          height: domRect.height
        };
        return JSON.stringify(objRect, null, 2);
      });
    };
    // Returns the reportable bounding box of an element.
    const reportBox = async (stateToggle, agentName, minWidth, minHeight, element) => {
      // Identify the bounding box of the element itself.
      const ownBoxJSON = await boxJSON(element);
      const ownBox = JSON.parse(ownBoxJSON);
      // Report it.
      boxes[stateToggle][agentName] = {own: rounded(ownBox)};
      // If it is large enough:
      if (ownBox.width >= minWidth && ownBox.height >= minHeight) {
        // Return the bounding box.
        return ownBox;
      }
      // Otherwise, i.e. if it is too small:
      else {
        // Identify the parent element of the element.
        const parent = await element.getProperty('parentElement');
        // Identify the bounding box of the parent.
        const parentBoxJSON = await boxJSON(parent);
        const parentBox = JSON.parse(parentBoxJSON);
        // Report it.
        boxes[stateToggle][agentName].parent = rounded(parentBox);
        // Return the bounding box.
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
    const shoot = async (page, element, hasState, agent, boxJSON) => {
      if (! globals.response.writableEnded) {
        // If specified, change the element state.
        await hasState ? element[query.state]() : Promise.resolve('');
        // Ensure that the element is within the viewport.
        // await element.scrollIntoViewIfNeeded();
        const stateToggle = hasState ? 'on' : 'off';
        // Identify the reportable bounding box of the element.
        let elementBox = await reportBox(
          stateToggle, agent.name(), minWidth, minHeight, element
        );
        // Identify a sample of the text content of the element.
        const text = await textSample(element, 40);
        // If the element has a reportable bounding box:
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
          else if (elementBox.width < minWidth || elementBox.height < minHeight) {
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
            // Make and report a screen shot of it.
            await page.screenshot({
              clip: shotBox(10, elementBox),
              path: `screenShots/example-00-${stateToggle}-${agent.name()}.png`,
              fullPage: true
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
      // Identify a Browser of the specified type.
      const ui = await agent.launch();
      // Identify a Page (tab).
      const page = await ui.newPage();
      // Navigate to the specified URL.
      await page.goto(query.url);
      // Identify the specified ElementHandle.
      const element = await page.$(`:nth-match(${query.elementType}, ${query.elementIndex})`);
      // If it exists:
      if (element) {
        // Identify its known or not-yet-known location.
        const boxJSON = elementBoxJSON || await boxJSON(element);
        // Make 2 screen shots of it.
        await shoot(page, element, false, agent, boxJSON);
        await shoot(page, element, true, agent, boxJSON);
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
