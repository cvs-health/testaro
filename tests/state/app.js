// Compiles a report.
exports.reporter = async page => {
  // CONSTANTS AND VARIABLES
  const debug = false;
  const minHeight = 10;
  const minWidth = 10;
  let margin = 20;
  const result = {};
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
  const shoot = async (page, reportBox, hasState, agentName) => {
    // If an element exists and its state change is required:
    if (reportBox.elements.length && hasState) {
      // Make the change.
      await reportBox.elements[0].focus();
    }
    // Make a screen shot.
    await page.screenshot({
      clip: getShotBox(margin, reportBox.box),
      path: `screenShots/state-${hasState ? 'on' : 'off'}-${agentName}.png`,
      fullPage: true
    });
  };
  // Creates and records 2 screen shots in a browser.
  const shootBoth = async agentName => {
    // If the agent is not Chrome:
    if (agentName !== 'chromium') {
      // Create and launch a browser and perform the preparations.
      page = await (debug, agentName);
    }
    // Identify the specified ElementHandle.
    const selector = `${query.elementType}:visible`;
    const element = await page.$(`:nth-match(${selector}, ${query.elementIndex})`);
    // If it exists:
    if (element) {
      // Determine its reportable bounding box:
      const reportBox = await getReportBox(element);
      // If it exists:
      if (reportBox.box.width) {
        // Make 2 screen shots of the element.
        await shoot(page, reportBox, false, agentName || 'chromium');
        await shoot(page, reportBox, true, agentName || 'chromium');
        return true;
      }
      else {
        return false;
      }
    }
  };
  // FUNCTION DEFINITIONS END
  // Make the screen shots in Chrome.
  const shot = await shootBoth('chromium');
  // If the shooting succeeded:
  if (shot) {
    // Make them in Firefox and Safari.
    await shootBoth('firefox');
    await shootBoth('webkit');
  }
  // Return report data.
  return {
    json: true,
    data
  };
};
