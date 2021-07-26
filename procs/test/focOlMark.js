// Marks the focused in-body element’s outline status and returns it and a focus status.
exports.focOlMark = async page => {
  // Identify a JSHandle of the focused element, if any, and a status.
  const jsHandle = await page.evaluateHandle(() => {
    // Identify the focused element.
    const focus = document.activeElement;
    // If it exists and is within the body:
    if (focus && focus !== document.body) {
      // Initialize the status.
      let status = 'already';
      // If it was not previously focused:
      if (! focus.dataset.autotestFocused) {
        // Determine whether it is exempt from being outlined.
        const isExempt = focus.hasAttribute('aria-activedescendant');
        // Determine whether it is outlined.
        const outlineWidth = window.getComputedStyle(focus).outlineWidth;
        const isOutlined = outlineWidth.length && outlineWidth !== '0px';
        // Mark it as focused and whether it must be and is outlined.
        focus.setAttribute(
          'data-autotest-focused', `${isExempt ? 'N' : 'Y'}${isOutlined ? 'Y' : 'N'}`
        );
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
  });
  // Get the status.
  const jsHandleMap = await jsHandle.getProperties();
  const focusJSHandle = jsHandleMap.get('0');
  const statusJSHandle = jsHandleMap.get('1');
  const focus = focusJSHandle ? await focusJSHandle.asElement() : null;
  const status = await statusJSHandle.jsonValue();
  // Return the focused element, if any, and the status.
  return [focus, status];
};
