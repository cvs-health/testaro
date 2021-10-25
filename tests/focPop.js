// Finds and reports navigation elements that can be focus-disclosed.
exports.reporter = async page => {
  // Identify the count of visible focusable elements.
  const initialFocusableCount = await page.$$eval(
    'body *:visible',
    visibles => visibles.filter(visible => visible.tabIndex === 0).length
  );
  // Repeatedly perform a Tab keypress until the focus exits the page.
  let focusInPage = true;
  let focusedElementCount = -1;
  while (focusInPage) {
    focusedElementCount++;
    await page.keyboard.press('Tab');
    focusInPage = await page.evaluate(() => document.activeElement !== null);
  }
  // Return the result.
  return {result: {
    initialFocusableCount,
    focusedElementCount,
    focusTriggered: focusedElementCount - initialFocusableCount
  }};
};
