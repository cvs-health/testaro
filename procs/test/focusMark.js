// Marks the focused in-body element, if any, and returns it and a status.
exports.focusMark = async (page, lastNavKey) => {
  // Identify a JSHandle of the focused element, if any, and a status.
  const jsHandle = await page.evaluateHandle(lastNavKey => {
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
      // If it was not previously focused:
      if (! focus.dataset.autotestFocused) {
        // Mark it as focused and how.
        focus.setAttribute('data-autotest-focused', lastNavKey);
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
  }, lastNavKey)
  .catch(error => {
    console.log(`ERROR: FOCUS MARKING FAILED (${error.message})`);
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
