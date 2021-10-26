// Reports discrepancies between focusable and Tab-focused element counts.
exports.reporter = async page => {
  // Identify the count of visible focusable elements.
  const tabFocusables = await page.$$eval(
    'body *:visible',
    visibles => {
      const focusables = visibles.filter(visible => visible.tabIndex === 0);
      // Count as focusable only 1 radio button per group.
      const radios = focusables.filter(el => el.tagName === 'INPUT' && el.type === 'radio');
      const radioNames = new Set(radios.map(radio => radio.name));
      return focusables.length - radios.length + radioNames.size;
    }
  );
  // Repeatedly perform a Tab or (in webkit) Opt-Tab keypress until the focus exits the page.
  let focusInPage = true;
  let tabFocused = -1;
  while (focusInPage && tabFocused < 5000) {
    tabFocused++;
    await page.keyboard.press(page.browserTypeName === 'webkit' ? 'Alt+Tab' : 'Tab');
    focusInPage = await page.evaluateHandle(() => {
      const focus = document.activeElement;
      if (focus === null || focus.tagName === 'BODY' || focus.dataset.autotestfocused) {
        return false;
      }
      else {
        focus.dataset.autotestfocused = 'true';
        return true;
      }
    });
  }
  // Return the result.
  return {result: {
    tabFocusables,
    tabFocused,
    discrepancy: tabFocusables - tabFocused
  }};
};
