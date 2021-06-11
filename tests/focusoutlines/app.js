// Tabulates focusable elements and those with outlines when focused.
exports.reporter = async page => {
  let focusInDoc = true;
  let focusables = 0;
  let outlined = 0;
  // As long as Tab keypresses move the focus to within the page:
  while (focusInDoc) {
    // Press the Tab key.
    await page.keyboard.press('Tab');
    const verdict = await page.evaluate(() => {
      // Identify the newly focused element.
      const focused = document.activeElement;
      // If it is a focusable element in the page:
      if (focused && focused !== document.body) {
        const outlineWidth = window.getComputedStyle(focused).outlineWidth;
        if (outlineWidth !== '0px') {
          return [true, 1, 1];
        }
        else {
          return [true, 1, 0];
        }
      }
      else {
        return [false, 0, 0];
      }
    });
    focusInDoc = verdict[0];
    focusables += verdict[1];
    outlined += verdict[2];
  }
  return {
    result: {
      focusables,
      outlined,
      outlinedPercent: Math.floor(100 * outlined / focusables)
    }
  };
};
