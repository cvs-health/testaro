// Returns a tabulation, and lists of texts, of elements with and without focal outlines.
exports.focusOutline = async page => {
  // Initialize the result properties.
  let focusableCount = 0;
  let outlinedCount = 0;
  const outlinedTexts = [];
  const plainTexts = [];
  // Import the textOwn function.
  const {allText} = require('./alltext');
  // FUNCTION DEFINITION START
  // Identifies an ElementHandle of the focused in-body element or a failure status.
  const focused = async () => {
    // Identify a JSHandle of the focused element or a failure status.
    const focusJSHandle = await page.evaluateHandle(() => {
      // Identify the focused element.
      const focus = document.activeElement;
      // If it exists and is within the body:
      if (focus && focus !== document.body) {
        // If it has not previously been focused:
        if (! focus.dataset.autotestFocused) {
          // Mark it as previously focused.
          focus.setAttribute('data-autotest-focused', '1');
          // Return it.
          return focus;
        }
        // Otherwise, i.e. if it has been previously focused:
        else {
          // Return a status message.
          return {atFocusStatus: 'already'};
        }
      }
      // Otherwise, i.e. if it does not exist or is the body itself:
      else {
        // Return a status message.
        return {atFocusStatus: 'no'};
      }
    });
    // Get the failure status.
    const status = focusJSHandle.getProperty('atFocusStatus');
    // If there is one:
    if (status) {
      // Return it.
      return status;
    }
    // Otherwise, i.e. if an element within the body is newly focused:
    else {
      // Return its ElementHandle.
      return focusJSHandle.asElement();
    }
  };
  // FUNCTION DEFINITION END
  // Initialize the status.
  let statusOK = true;
  // Identify the navigation-key sequence.
  const nextNavKeys = {
    Tab: ['ArrowRight', null],
    ArrowRight: ['ArrowRight', 'ArrowDown'],
    ArrowDown: ['ArrowDown', 'Tab']
  };
  // Press the Tab key.
  await page.keyboard.press('Tab');
  // Initialize the last-pressed navigation key.
  let lastNavKey = 'Tab';
  // As long as there is no failure status:
  while (statusOK) {
    // Identify and mark the newly focused element or report a failure.
    const focus = await focused();
    // If there is a newly focused element:
    if (typeof focus === 'object') {
      // Get its text.
      const focusText = await allText(page, focus);
      // Determine whether it is outlined when focused.
      const verdict = await page.evaluate(focus => {
        const outlineWidth = window.getComputedStyle(focus).outlineWidth;
        return outlineWidth === '0px' ? 0 : 1;
      }, focus);
      // Increment the applicable counts.
      focusableCount++;
      outlinedCount += verdict;
      if (verdict) {
        outlinedTexts.push(focusText);
      }
      else {
        plainTexts.push(focusText);
      }
      // Press the next post-success navigation key.
      await page.keyboard.press(nextNavKeys[lastNavKey][0]);
    }
    // Otherwise, if the focused element was previously focused:
    else if (focus === 'already') {
      // If the last navigation key was Tab:
      if (lastNavKey === 'Tab') {
        // Quit.
        statusOK = false;
      }
      // Otherwise, i.e. if the last navigation key was an arrow key:
      else {
        // Press the next post-failure navigation key.
        await page.keyboard.press(nextNavKeys[lastNavKey][1]);
      }
    }
    // Otherwise, if the focused element is not within the body:
    else if (focus === 'no') {
      // Quit.
      statusOK = false;
    }
    // Otherwise, if there was an error:
    else {
      // Report it.
      console.log('ERROR');
    }
  }
  // Return the result.
  return {
    result: {
      focusableCount,
      outlinedCount,
      outlinedPercent: Math.floor(100 * outlinedCount / focusableCount),
      outlinedTexts,
      plainTexts
    }
  };
};
