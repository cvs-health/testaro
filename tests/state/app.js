// Compiles a report.
exports.reporter = async page => {
  // CONSTANTS AND VARIABLES
  const minHeight = 10;
  const minWidth = 10;
  let margin = 20;
  const result = {};
  const unique = Math.floor(process.uptime());
  // FUNCTION DEFINITIONS START
  // Validates the location and size of a bounding box.
  const boxValidity = box => ({
    existence: !! box,
    location: box && box.x >= 0 && box.y >= 0,
    size: box && box.width >= minWidth && box.height >= minHeight
  });
  // Returns the reportable bounding box of an element and that box’s element(s).
  const getReportBox = async element => {
    // Get and validate the element’s own bounding box.
    const ownBox = await element.boundingBox();
    const ownBoxValidity = boxValidity(ownBox);
    // If it is satisfactory:
    if (ownBoxValidity.location && ownBoxValidity.size) {
      // Return it and its element.
      return {
        elements: [element],
        box: ownBox
      };
    }
    // Otherwise, i.e. if it is not satisfactory:
    else {
      // Identify the parent element of the element.
      const parent = await element.getProperty('parentElement');
      // Get and validate the parent’s bounding box.
      const parentBox = await parent.boundingBox();
      const parentBoxValidity = boxValidity(parentBox);
      // If it is satisfactory:
      if (parentBoxValidity.location && parentBoxValidity.size) {
        // Return it and its element.
        return {
          elements: [element, parent],
          box: parentBox
        };
      }
      // Otherwise, i.e. if it is not satisfactory:
      else {
        // Identify the grandparent element of the element.
        const grandparent = await parent.getProperty('parentElement');
        // Get and validate the grandparent’s bounding box.
        const grandparentBox = await grandparent.boundingBox();
        const grandparentBoxValidity = boxValidity(grandparentBox);
        // If it is satisfactory:
        if (grandparentBoxValidity.location && grandparentBoxValidity.size) {
          // Return it and its element.
          return {
            elements: [element, parent, grandparent],
            box: grandparentBox
          };
        }
        // Otherwise, i.e. if it is not satisfactory:
        else {
          // Add the error to the result.
          result.error = 'Failure to determine valid bounding box for element';
          // Return the nonexistence of a bounding box and its element.
          return {
            elements: [],
            box: null
          };
        }
      }
    }
  };
  // Returns a clipping object for a screenshot with a margin around a bounding box.
  const getShotBox = (margin, box) => {
    const marginLeft = Math.min(margin, box.x);
    const marginTop = Math.min(margin, box.y);
    return {
      x: box.x - marginLeft,
      y: box.y - marginTop,
      width: box.width + marginLeft + margin,
      height: box.height + marginTop + margin
    };
  };
  // Creates and records a screen shot.
  const shoot = async (page, reportBox, state) => {
    // If an element exists:
    if (reportBox.elements.length) {
      // Put it into the specified states.
      if (['focus', 'both'].includes(state)) {
        await reportBox.elements[0].focus();
      }
      else {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
      }
      if (['hover', 'both'].includes(state)) {
        await reportBox.elements[0].hover();
      }
      else {
        await reportBox.elements[0].dispatchEvent('mouseout');
      }
    }
    // Make a screen shot.
    await page.screenshot({
      clip: getShotBox(margin, reportBox.box),
      path: `screenShots/${unique}-${state}.png`,
      fullPage: true
    });
  };
  // Creates and records 2 screen shots in a browser.
  const shootAll = async () => {
    // Identify a JSHandle of the specified element.
    const elementJS = await page.evaluateHandle(() => document.activeElement);
    // If it exists:
    if (elementJS) {
      // Make it an ElementHandle.
      const element = elementJS.asElement();
      // If that succeeded:
      if (element) {
        // Determine its reportable bounding box:
        const reportBox = await getReportBox(element);
        // If it exists:
        if (reportBox.box.width) {
          // Make 4 screen shots of the element.
          await shoot(page, reportBox, 'normal');
          await shoot(page, reportBox, 'focus');
          await shoot(page, reportBox, 'hover');
          await shoot(page, reportBox, 'both');
          // Return success.
          return true;
        }
        // Otherwise, i.e. if the reportable bounding box does not exist:
        else {
          // Return failure.
          return false;
        }
      }
      // Otherwise, i.e. if the element could not be made an ElementHandle
      else {
        // Return failure.
        return false;
      }
    }
    // Otherwise, i.e. if a JSHandle of the element could not be identified:
    else {
      // Return failure.
      return false;
    }
  };
  // FUNCTION DEFINITIONS END
  // Make the screen shots in Chrome.
  const shot = await shootAll();
  // If the shooting succeeded:
  if (shot) {
    const states = {
      normal: 'Normal',
      focus: 'Focus',
      hover: 'Hover',
      both: 'Focus and hover'
    };
    const figureOf = state => `<figure><figcaption>${states[state]}</figcaption><img src="screenshots/${unique}-${state}.png" alt="${states[state]} state of image"></figure>`;
    const figures = Object.keys(states).map(state => figureOf(state)).join('\n          ');
    const exhibits = `<h3>__browserTypeName__</h3>\n${figures}\n</h3>`;
    // Return success and the exhibits.
    return {
      result: 'screenshots made',
      exhibits
    };
  }
  // Otherwise, i.e. if the shooting failed:
  else {
    // Return failure.
    return {
      result: 'screenshots failed'
    };
  }
};
