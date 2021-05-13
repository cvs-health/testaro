// Compiles a report.
exports.reporter = async (page, query) => {
  // CONSTANTS AND VARIABLES
  const debug = false;
  const minHeight = 10;
  const minWidth = 10;
  query.State = query.state === 'focus' ? 'Focused' : 'Hovered';
  const {firefox, webkit} = require('playwright');
  let margin = 20;
  const data = {
    elementType: query.elementType,
    elementIndex: query.elementIndex,
    result: 'Success'
  };
  // FUNCTION DEFINITIONS START
  // Validates the location and size of a bounding box.
  const boxValidity = box => ({
    existence: !! box,
    location: box && box.x >= 0 && box.y >= 0,
    size: box && box.width >= minWidth && box.height >= minHeight
  });
  // Returns the reportable bounding box of an element and that box’s element.
  const getReportBox = async element => {
    // If the specified element is an input and the state is hover:
    if (query.elementType === 'input' && query.state === 'hover') {
      // Increase the margin if the element is labeled.
      const labels = await element.getProperty('labels');
      const labelCount = await labels.getProperty('length');
      if (labelCount) {
        margin = 50;
      }
    }
    // Get and validate the element’s own bounding box.
    const ownBox = await element.boundingBox();
    const ownBoxValidity = boxValidity(ownBox);
    // If it is satisfactory:
    if (ownBoxValidity.location && ownBoxValidity.size) {
      // Return it and its element.
      return {
        element,
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
          element: parent,
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
            element: grandparent,
            box: parentBox
          };
        }
        // Otherwise, i.e. if it is not satisfactory:
        else {
          // Record the error.
          data.result = 'Failure to determine valid bounding box for element';
          // Return an error result.
          return {};
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
  const shoot = async (page, element, reportBox, hasState, agentName) => {
    // If a state change is required:
    if (hasState) {
      // Make the change.
      await query.state === 'focus' ? element.focus() : reportBox.element.hover();
    }
    // Make and report a screen shot.
    await page.screenshot({
      clip: getShotBox(margin, reportBox.box),
      path: `screenShots/state-${hasState ? 'on' : 'off'}-${agentName}.png`,
      fullPage: true
    });
  };
  // Creates and records 2 screen shots in a browser.
  const shootBoth = async (agent, reportBox) => {
    // If the agent is not Chrome:
    if (agent) {
      const ui = await agent.launch(debug ? {headless: false, slowMo: 3000} : {});
      page = await ui.newPage();
    }
    // Identify the specified ElementHandle.
    const selector = `${query.elementType}:visible`;
    const element = await page.$(`:nth-match(${selector}, ${query.elementIndex})`);
    // If it exists:
    if (element) {
      // If its reportable bounding box is not yet known:
      if (! reportBox) {
        // Determine it.
        reportBox = await getReportBox(element);
      }
      // If a reportable bounding box exists:
      if (reportBox.element) {
        const agentName = agent ? agent.name : 'Chrome';
        // Make 2 screen shots of the element.
        console.log(`reportBox is ${JSON.stringify(reportBox, null, 2)}`);
        await shoot(page, element, reportBox, false, agentName);
        await shoot(page, element, reportBox, true, agentName);
      }
    }
    return reportBox;
  };
  // FUNCTION DEFINITIONS END
  // Make the screen shots.
  const reportBox = await shootBoth(null, null);
  if (reportBox.element) {
    await shootBoth(firefox, reportBox);
    await shootBoth(webkit, reportBox);
  }
  // Return report data.
  return {
    json: true,
    data
  };
};
