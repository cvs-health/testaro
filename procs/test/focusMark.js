// Marks and returns the focused in-body element or returns a status.
exports.focusMark = async (page, lastNavKey) => {
  // Identify a JSHandle of the focused element or a failure status.
  const focusJSHandle = await page.evaluateHandle(lastNavKey => {
    // Identify the focused element.
    const focus = document.activeElement;
    // If it exists and is within the body:
    if (focus && focus !== document.body) {
      // If it was not previously focused:
      if (! focus.dataset.autotestFocused) {
        // Mark it as focused and how.
        focus.setAttribute('data-autotest-focused', lastNavKey);
        // Return it.
        return focus;
      }
      // Otherwise, i.e. if it was previously focused:
      else {
        // Return a status.
        return {status: 'already'};
      }
    }
    // Otherwise, i.e. if it does not exist or is the body itself:
    else {
      // Return a status.
      return {status: 'external'};
    }
  }, lastNavKey);
  // Get the status.
  const statusHandle = await focusJSHandle.getProperty('status');
  const status = await statusHandle.jsonValue();
  // If there is one:
  if (status) {
    // Return it as a string.
    return status;
  }
  // Otherwise, i.e. if an element within the body is newly focused:
  else {
    // Return its ElementHandle.
    return focusJSHandle.asElement();
  }
};
