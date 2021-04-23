// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url', 'elementType', 'elementIndex', 'state'])) {
    const minHeight = 10;
    const minWidth = 10;
    query.State = query.state === 'focus' ? 'Focused' : 'Hovered';
    const {chromium, firefox, webkit} = require('playwright');
    let reportBox;
    let margin = 20;
    let reportElement;
    let reportLevel = 0;
    // FUNCTION DEFINITIONS START
    // Return a sample of the text content of an element.
    const getTextSample = async (element, maxLength) => {
      let textContent = await element.textContent();
      textContent = textContent.replace(/[<>]/g, ' ');
      const isShort = textContent.length <= maxLength;
      return isShort ? textContent : `${textContent.slice(0, maxLength)}&hellip;`;
    };
    // Reports an invalid bounding box.
    const reportBadBox = async (box, element, isOffPage) => {
      // Get a text sample of the element.
      const textSample = await getTextSample(element, 40);
      // Report the error.
      globals.serveMessage(
        `
          ERROR: <code>&lt;${query.elementType}&gt;</code> number ${query.elementIndex}
          (${textSample}) has invalid ${isOffPage ? 'location' : 'size'}:
          <br><pre>${JSON.stringify(box, null, 2)}</pre>
        `,
        globals.response
      );
    };
    // Validates the location and size of a bounding box.
    const validateBox = async (box, isFinal, element, boxElement) => {
      // If the box does not exist or is too small:
      if (! box || box.width < minWidth || box.height < minHeight) {
        // If it is the final box:
        if (isFinal) {
          // Report the error.
          await reportBadBox(box, element, false);
          // Return the result.
          return [true, false];
        }
        // Otherwise, i.e. if it is not the final box:
        else {
          // Return the result.
          return [true, false];
        }
      }
      // Otherwise, if the box is above or before the document:
      else if (box.x < 0 || box.y < 0) {
        // Report the error.
        await reportBadBox(box, element, true);
        // Return the result.
        return [false, null];
      }
      // Otherwise, i.e. if the box is valid:
      else {
        // Return the result.
        return [true, true];
      }
    };
    // Returns the reportable bounding box of an element and records the box’s element.
    const getReportBox = async (element) => {
      // Get and validate the element’s own bounding box.
      if (query.elementType === 'input' && query.state === 'hover') {
        const labels = await element.getProperty('labels');
        const labelCount = await labels.getProperty('length');
        if (labelCount) {
          margin = 50;
        }
      }
      const ownBox = await element.boundingBox();
      const ownBoxResults = await validateBox(ownBox, false, element, element);
      // If it does not exist or is within the document:
      if (ownBoxResults[0]) {
        // If it exists and is large enough:
        if (ownBoxResults[1]) {
          // Return it.
          reportElement = element;
          return ownBox;
        }
        // Otherwise, i.e. if it does not exist or is too small:
        else {
          // Identify the parent element of the element.
          const parent = await element.getProperty('parentElement');
          // Get and validate the parent’s bounding box.
          const parentBox = await parent.boundingBox();
          const parentBoxResults = await validateBox(parentBox, false, element, parent);
          // If it does not exist or is within the document:
          if (parentBoxResults[0]) {
            // If it exists and is large enough:
            if (parentBoxResults[1]) {
              // Return it.
              reportElement = parent;
              reportLevel = 1;
              return parentBox;
            }
            // Otherwise, i.e. if it does not exist or is too small:
            else {
              // Identify the grandparent element of the element.
              const grandparent = await parent.getProperty('parentElement');
              // Get and validate the grandparent’s bounding box.
              const grandparentBox = await grandparent.boundingBox();
              const grandparentBoxResults = await validateBox(
                grandparentBox, true, element, grandparent
              );
              // If it is valid:
              if (grandparentBoxResults[1]) {
                // Return it.
                reportElement = grandparent;
                reportLevel = 2;
                return grandparentBox;
              }
              else {
                return Promise.resolve(null);
              }
            }
          }
        }
      }
      else {
        return Promise.resolve(null);
      }
    };
    // Returns a clipping object for a screenshot with a margin around a bounding box.
    const getShotBox = (margin, reportBox) => {
      const marginLeft = Math.min(margin, reportBox.x);
      const marginTop = Math.min(margin, reportBox.y);
      return {
        x: reportBox.x - marginLeft,
        y: reportBox.y - marginTop,
        width: reportBox.width + marginLeft + margin,
        height: reportBox.height + marginTop + margin
      };
    };
    // Creates and records a screen shot.
    const shoot = async (page, element, hasState, agent) => {
      if (! globals.response.writableEnded) {
        // If a state change is required:
        if (hasState) {
          // If to a focus state:
          if (query.state === 'focus') {
            // Put the element into a focus state.
            await element.focus();
          }
          // Otherwise, if to a hover state:
          else if (query.state === 'hover') {
            // Put the reportable element into a hover state.
            if (reportElement) {
              await reportElement.hover();
            }
            else if (reportLevel === 0) {
              await element.hover();
            }
            else if (reportLevel === 1) {
              await element.getProperty('parentElement').then(el => el.hover());
            }
            else if (reportLevel === 2) {
              await element.getProperty('parentElement')
              .then(pe => pe.getProperty('parentElement'))
              .then(ge => ge.hover());
            }
          }
        }
        // Make and report a screen shot of the element.
        await page.screenshot({
          clip: getShotBox(margin, reportBox),
          path: `screenShots/example-00-${hasState ? 'on' : 'off'}-${agent.name()}.png`,
          fullPage: true
        });
      }
    };
    // Creates and records 2 screen shots in a browser.
    const shootBoth = async (agent, findsBox, headless, slowMo) => {
      // Launch a Browser of the specified type.
      const ui = await agent.launch({headless, slowMo});
      // Identify a Page (tab).
      const page = await ui.newPage();
      // Navigate to the specified URL.
      await page.goto(query.url);
      // Identify the specified ElementHandle.
      const selector = `${query.elementType}:visible`;
      const element = await page.$(`:nth-match(${selector}, ${query.elementIndex})`);
      // If it exists:
      if (element) {
        // Record the bounding box if specified.
        await findsBox ? (reportBox = await getReportBox(element)) : Promise.resolve('');
        // If a reportable bounding box exists:
        if (reportBox) {
          // Make 2 screen shots of the element.
          await shoot(page, element, false, agent);
          await shoot(page, element, true, agent);
          // Quit the browser.
          reportElement = null;
          ui.close();
        }
        else {
          // Quit the browser.
          ui.close();
        }
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
      await shootBoth(chromium, true, true, 0);
      if (reportBox) {
        await shootBoth(firefox, false, true, 0);
        await shootBoth(webkit, false, true, 0);
      }
      // Render and serve a report.
      globals.render('example-00-out', true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
