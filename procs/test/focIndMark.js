/*
  Marks the previously focused in-body element’s focus indication and returns the currently
  focused in-body element and a focus status.
*/
exports.focIndMark = async page => {
  if (! page.custom) {
    page.custom = {};
  }
  if (! page.custom.priorFocus) {
    page.custom.priorFocus = {};
  }
  // Wait 0.1 second for focus indication to change.
  await page.waitForTimeout(100);
  // Identify a JSHandle of the focused element, if any, and a status.
  const jsHandle = await page.evaluateHandle(args => {
    const priorElement = args[0];
    const priorFocusStyle = args[1];
    // Compare the previous and current styles of the previously focused element, if any.
    if (priorElement) {
      const priorStyleNow = window.getComputedStyle(priorElement);
      const changed = JSON.stringify(priorStyleNow) !== JSON.stringify(priorFocusStyle);
      // Mark it accordingly.
      priorElement.setAttribute('data-autotest-focused', `${changed ? 'Y' : 'N'}`);
    }
    // Initialize the focused element.
    let focus = document.activeElement;
    // If it exists and is within the body:
    if (focus && focus !== document.body) {
      // Change it to the effectively focused element if different.
      if (focus.hasAttribute('aria-activedescendant')) {
        focus = document.getElementById(focus.getAttribute('aria-activedescendant'));
      }
      // Initialize the status and the newly focused element and its style.
      let status = 'already';
      let newElement = null;
      let newFocusStyle = null;
      // If the element was not previously focused:
      if (! focus.dataset.autotestFocused) {
        // Identify it and its style.
        newElement = focus;
        newFocusStyle = window.getComputedStyle(focus);
        // Revise the status.
        status = 'new';
      }
      // Return the element, status, and recordable data.
      return [focus, status, newElement, newFocusStyle];
    }
    // Otherwise, i.e. if it does not exist or is the body itself:
    else {
      // Return that fact and a status.
      return [null, 'external', null, null];
    }
  }, [page.custom.priorFocus.element, page.custom.priorFocus.focusStyle])
  .catch(error => {
    console.log(`ERROR: FOCUS OUTLINE MARKING FAILED (${error.message})`);
    return '';
  });
  // Record the newly focused element and its style and return the focused element and the status.
  if (typeof jsHandle === 'string') {
    page.custom.priorFocus.element = null;
    page.custom.priorFocus.focusStyle = null;
    return [null, 'external'];
  }
  else {
    const props = await require('./jsHandleProps')
    .jsHandleProps(jsHandle, [true, false, true, false]);
    page.custom.priorFocus.element = props[2];
    page.custom.priorFocus.focusStyle = props[3];
    return props.slice(0, 2);
  }
};
