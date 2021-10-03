// Marks the focused in-body element’s outline status and returns it and a focus status.
exports.focOlMark = async page => {
  // Wait 0.1 second for an outline to appear on the focused element.
  try {
    await page.waitForFunction(
      () => window.getComputedStyle(document.activeElement).outlineWidth !== '0px',
      null,
      {timeout: 100}
    );
  }
  catch (error) {
    1;
  }
  // Identify a JSHandle of the focused element, if any, and a status.
  const jsHandle = await page.evaluateHandle(() => {
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
        // Determine whether it is outlined.
        const outlineWidth = window.getComputedStyle(focus).outlineWidth;
        const isOutlined = outlineWidth.length && outlineWidth !== '0px';
        // Mark it as focused and whether it is outlined.
        focus.setAttribute('data-autotest-focused', `${isOutlined ? 'Y' : 'N'}`);
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
    console.log(`ERROR: Focus outline marking failed (${error.message})`);
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
