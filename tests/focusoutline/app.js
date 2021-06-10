// Tabulates and lists focusable elements with and without outlines when focused.
exports.reporter = async page => {
  // Initialize the result properties.
  let focusInDoc = true;
  let focusableCount = 0;
  let outlinedCount = 0;
  const outlinedTexts = [];
  const plainTexts = [];
  // Import the textOwn function.
  const {textOwn} = require('../../procs/test/textown');
  // As long as Tab keypresses move the focus to within the page:
  while (focusInDoc) {
    // Press the Tab key.
    await page.keyboard.press('Tab');
    // Identify the newly focused element.
    const focusedJSHandle = await page.evaluateHandle(() => document.activeElement);
    const focused = focusedJSHandle.asElement();
    // Get its tag name.
    const focusTagNameHandle = await focused.getProperty('tagName');
    const focusTagName = await focusTagNameHandle.jsonValue();
    // If it is a focusable element on the page:
    if (focused && focusTagName !== 'BODY') {
      // Get its text.
      const focusedText = await textOwn(page, focused);
      // Update the result properties.
      const verdict = await page.evaluate(focused => {
        const outlineWidth = window.getComputedStyle(focused).outlineWidth;
        if (outlineWidth !== '0px') {
          return [true, 1, 1];
        }
        else {
          return [true, 1, 0];
        }
      }, focused);
      focusableCount += verdict[1];
      outlinedCount += verdict[2];
      if (verdict[2]) {
        outlinedTexts.push(focusedText);
      }
      else {
        plainTexts.push(focusedText);
      }
    }
    else {
      focusInDoc = false;
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
