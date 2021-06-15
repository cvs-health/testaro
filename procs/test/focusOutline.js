// Returns a tabulation, and lists of texts, of elements with and without focal outlines.
exports.focusOutline = async (page, withTexts) => {
  // Initialize the result properties.
  let focusableCount = 0;
  let outlinedCount = 0;
  const outlinedTexts = [];
  const plainTexts = [];
  // Import the textOwn function if necessary.
  const allText = withTexts ? require('./allText').allText : '';
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
    const statusHandle = await focusJSHandle.getProperty('atFocusStatus');
    const status = await statusHandle.jsonValue();
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
  // FUNCTION DEFINITION START
  // Recursively reports on focus outlines.
  const reportOutlines = async () => {
    // Identify and mark the newly focused element or report a failure.
    const focus = await focused();
    // Identify the failure status, if any.
    const failure = typeof focus === 'string' ? focus : null;
    // If it is a refocused element and the last navigation key was an arrow key:
    if (failure === 'already' && ['ArrowRight', 'ArrowDown'].includes(lastNavKey)) {
      // Press the next post-failure navigation key.
      await page.keyboard.press(lastNavKey = nextNavKeys[lastNavKey][1]);
      // Process the element focused by that keypress.
      await reportOutlines();
    }
    // Otherwise, if there is no failure:
    else if (! failure) {
      // Get the text of the newly focused element if necessary.
      const focusText = withTexts ? await allText(page, focus) : '';
      // Determine whether it is outlined when focused.
      const verdict = await page.evaluate(focus => {
        const outlineWidth = window.getComputedStyle(focus).outlineWidth;
        return outlineWidth === '0px' ? 0 : 1;
      }, focus);
      // Increment the applicable counts.
      focusableCount++;
      outlinedCount += verdict;
      if (withTexts) {
        if (verdict) {
          outlinedTexts.push(focusText);
        }
        else {
          plainTexts.push(focusText);
        }
      }
      // Press the next post-success navigation key.
      await page.keyboard.press(lastNavKey = nextNavKeys[lastNavKey][0]);
      // Process the element focused by that keypress.
      await reportOutlines();
    }
  };
  // FUNCTION DEFINITION END
  await reportOutlines();
  // Return the result.
  const result = {
    focusableCount,
    outlinedCount,
    outlinedPercent: Math.floor(100 * outlinedCount / focusableCount)
  };
  if (withTexts) {
    result.outlinedTexts = outlinedTexts;
    result.plainTexts = plainTexts;
  }
  return {result};
};
