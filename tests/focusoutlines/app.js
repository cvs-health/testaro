// Tabulates focusable elements and those with outlines when focused.
exports.reporter = async page => {
  let bodyFocus = true;
  let focusables = 0;
  let outlined = 0;
  while (bodyFocus) {
    await page.keyboard.press('Tab');
    const verdict = await page.evaluate(() => {
      const focused = document.activeElement;
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
    bodyFocus = verdict[0];
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
