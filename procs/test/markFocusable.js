// Marks elements that can be keyboard-focused.
exports.markFocusable = async page => {

  // ## CONSTANTS

  // Navigation-key sequence. Next key after focus, refocus, body exit.
  const nextNavKeys = {
    'Shift+Tab': ['Shift+Tab', 'Shift+Tab', 'Tab'],
    Tab: ['ArrowRight', 'Tab', null],
    ArrowRight: ['ArrowRight', 'ArrowDown', 'ArrowDown'],
    ArrowDown: ['ArrowDown', 'Tab', 'Tab']
  };

  // ### FUNCTIONS

  // Identifies and marks the focused in-body element or identifies a failure status.
  const focused = async () => {
    // Identify a JSHandle of the focused element or a failure status.
    const focusJSHandle = await page.evaluateHandle(lastNavKey => {
      // Identify the focused element.
      const focus = document.activeElement;
      // If it exists and is within the body:
      if (focus && focus !== document.body) {
        // If it was not previously focused:
        if (! focus.dataset.autotestFocused) {
          // Change its status to previously focused.
          focus.setAttribute('data-autotest-focused', lastNavKey);
          // Return it.
          return focus;
        }
        // Otherwise, if it was previously refocused:
        else if (focus.dataset.autotestRefocused) {
          // Return a status message tantamount to final failure.
          return {atFocusStatus: 'no'};
        }
        // Otherwise, i.e. if it was previously focused but not refocused:
        else {
          // Add a refocused status to it.
          focus.setAttribute('data-autotest-refocused', lastNavKey);
          // Return a status message.
          return {atFocusStatus: 'already'};
        }
      }
      // Otherwise, i.e. if it does not exist or is the body itself:
      else {
        // Return a status message.
        return {atFocusStatus: 'no'};
      }
    }, lastNavKey);
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
  // Recursively focuses and marks elements.
  const markFocused = async () => {
    // Identify and mark the newly focused element or identify a failure.
    const focus = await focused();
    // Identify the next navigation key to be pressed.
    const nextKey = nextNavKeys[lastNavKey][['already', 'no'].indexOf(focus) + 1];
    // If it exists:
    if (nextKey) {
      // Press it and update the last navigation key.
      await page.keyboard.press(lastNavKey = nextKey);
      // Process the element focused by that keypress.
      await markFocused();
    }
  };

  // ### OPERATION

  // 
  // Press the Tab key and identify it as the last-pressed navigation key.
  await page.keyboard.press('Shift+Tab');
  let lastNavKey = 'Shift+Tab';
  // Recursively focus and mark elements.
  await markFocused();
  // Return the result.
  return 1;
};
