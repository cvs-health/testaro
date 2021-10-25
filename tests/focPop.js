// Finds and reports navigation elements that can be focus-disclosed (REQUIRES WEBKIT OR FIREFOX).
exports.reporter = async page => {
  // Identify the count of visible focusable elements.
  const initialFocusableCount = await page.$$eval(
    'body *:visible',
    visibles => {
      console.log(`There are ${visibles.length} visible elements`);
      const focusables = visibles.filter(visible => visible.tabIndex === 0);
      focusables.forEach(focusable => {
        console.log(focusable.tagName, focusable.textContent.trim());
      });
      return focusables.length;
    }
  );
  console.log(`Initial count ${initialFocusableCount}`);
  // Repeatedly perform a Tab or (in webkit) Opt-Tab keypress until the focus exits the page.
  let focusInPage = true;
  let focusedElementCount = -1;
  while (focusInPage && focusedElementCount < 100) {
    focusedElementCount++;
    await page.keyboard.press(page.browserTypeName === 'webkit' ? 'Alt+Tab' : 'Tab');
    focusInPage = await page.evaluate(() => {
      const focus = document.activeElement;
      console.log(`Focused ${focus.tagName}: ${focus.textContent.trim().slice(0, 50)}`);
      return focus !== null && focus.tagName !== 'BODY';
    });
  }
  // Return the result.
  return {result: {
    initialFocusableCount,
    focusedElementCount,
    focusTriggered: focusedElementCount - initialFocusableCount
  }};
};
