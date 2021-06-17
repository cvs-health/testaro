// Marks elements that can be operated.
exports.markOperable = async page => {

  // ### CONSTANTS

  // Operable tag names.
  const opTags = ['A', 'BUTTON', 'INPUT', 'OPTION', 'SELECT', 'TEXTAREA'];

  // ### FUNCTIONS

  // Mark an element as operable.
  const mark = async (page, element) => {
    await page.evaluate(element => {
      if (! element.dataset.autotestOperable) {
        element.setAttribute('data-autotest-operable', 1);
      }
    });
  };
  // Recursively finds and marks the elements that have operable tag names.
  const tagOperable = async (page, elements) => {
    // If any elements remain unprocessed:
    if (elements.length) {
      // Identify the first of them.
      const firstElement = elements[0];
      // Get its tag name.
      const tagNameJSHandle = await firstElement.getProperty('tagName');
      const tagName = await tagNameJSHandle.jsonValue();
      if (opTags.includes(tagName)) {
        await mark(page, firstElement);
      }
      // Determine whether 
    }
  };

  // Get ElementHandles for all elements in the body.
  const allElements = await page.$$('body *');

  // Navigation-key sequence.
  const nextNavKeys = {
    Tab: ['ArrowRight', null],
    ArrowRight: ['ArrowRight', 'ArrowDown'],
    ArrowDown: ['ArrowDown', 'Tab']
  };

  // ### FUNCTIONS

  // Identifies and marks the focused in-body element or identifies a failure status.
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
  // Recursively focuses and marks elements.
  const markFocused = async () => {
    // Identify and mark the newly focused element or identify a failure.
    const focus = await focused();
    // Identify the failure status, if any.
    const failure = typeof focus === 'string' ? focus : null;
    // If it is a refocused element and the last navigation key was an arrow key:
    if (failure === 'already' && ['ArrowRight', 'ArrowDown'].includes(lastNavKey)) {
      // Press the next post-failure navigation key.
      await page.keyboard.press(lastNavKey = nextNavKeys[lastNavKey][1]);
      // Process the element focused by that keypress.
      await markFocused();
    }
    // Otherwise, if there is no failure:
    else if (! failure) {
      // Press the next post-success navigation key.
      await page.keyboard.press(lastNavKey = nextNavKeys[lastNavKey][0]);
      // Process the element focused by that keypress.
      await markFocused();
    }
  };

  // ### OPERATION

  // Press the Tab key and identify it as the last-pressed navigation key.
  await page.keyboard.press('Tab');
  let lastNavKey = 'Tab';
  // Recursively focus and mark elements.
  await markFocused();
  // Return the result.
  return 1;
};
