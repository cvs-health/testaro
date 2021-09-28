/*
  Marks the previously focused in-body element’s focus indication and returns the currently
  focused in-body element and a focus status.
*/
exports.focIndMark = async page => {
  // Wait 0.1 second for focus indication to change.
  await page.waitForTimeout(100);
  // Identify a JSHandle of the focused element, if any, and a status.
  const jsHandle = await page.evaluateHandle(() => {
    // Compare the previously focused element’s previous and current styles.
    if (! page.custom) {
      page.custom = {};
    }
    if (! page.custom.priorFocus) {
      page.custom.priorFocus = {};
    }
    const priorStyleNow = page.custom.priorFocus.element.getComputedStyle();
    const priorStyleThen = page.custom.priorFocus.focusStyle;
    const changed = JSON.stringify(priorStyleNow) !== JSON.stringify(priorStyleThen);
    // Mark it accordingly.
    page.custom.priorFocus.element.setAttribute('data-autotest-focused', `${changed ? 'Y' : 'N'}`);
    // Initialize the focused element.
    let focus = document.activeElement;
    // If it exists and is within the body:
    if (focus && focus !== document.body) {
      // Change it to the effectively focused element if different.
      if (focus.hasAttribute('aria-activedescendant')) {
        focus = document.getElementById(focus.getAttribute('aria-activedescendant'));
      }
      // Initialize the status.
      let status = 'already';
      // If the element was not previously focused:
      if (! focus.dataset.autotestFocused) {
        // Record it and its style.
        page.custom.priorFocus.element = focus;
        const focusStyle = focus.getComputedStyle();
        page.custom.priorFocus.focusStyle = focusStyle;
        // Revise the status.
        status = 'new';
      }
      // Return the element and the status.
      return [focus, status];
    }
    // Otherwise, i.e. if it does not exist or is the body itself:
    else {
      // Return that fact and a status.
      return [null, 'external'];
    }
  })
  .catch(error => {
    console.log(`ERROR: FOCUS OUTLINE MARKING FAILED (${error.message})`);
    return '';
  });
  // Return the focused element and the status.
  if (typeof jsHandle === 'string') {
    return [null, 'external'];
  }
  else {
    return await require('./jsHandleProps').jsHandleProps(jsHandle, [true, false]);
  }
};
