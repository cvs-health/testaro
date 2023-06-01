/*
  focAll
  This test reports discrepancies between focusable and Tab-focused element counts. The test first
  counts all the visible focusable (i.e. with tabIndex 0) elements (except counting each group of
  radio buttons as only one focusable element). Then it repeatedly presses the Tab (or Option-Tab
  in webkit) key until it has reached all the elements it can and counts those elements. If the
  two counts differ, navigation can be made more difficult. The cause may be surprising changes in
  content during navigation with the Tab key, or inability to reach every focusable element (or
  widget, such as one radio button or tab in each group) merely by pressing the Tab key.
*/
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
  /*
    Repeatedly perform a Tab or (in webkit) Opt-Tab keypress and count the focused elements.
    Asumptions:
      0. No page has more than 2000 focusable elements.
      1. No shadow root that reports itself as the active element has more than 100 focusable
        descendants.
  */
  let tabFocused = 0;
  let refocused = 0;
  while (refocused < 100 && tabFocused < 2000) {
    await page.keyboard.press(page.browserTypeName === 'webkit' ? 'Alt+Tab' : 'Tab');
    const isNewFocus = await page.evaluate(() => {
      const focus = document.activeElement;
      if (focus === null || focus.tagName === 'BODY' || focus.dataset.autotestfocused) {
        return false;
      }
      else {
        focus.dataset.autotestfocused = 'true';
        return true;
      }
    });
    if (isNewFocus) {
      tabFocused++;
    }
    else {
      refocused++;
    }
  }
  const data = {
    tabFocusables,
    tabFocused,
    discrepancy: tabFocused - tabFocusables
  };
  // Reload the page.
  try {
    await page.reload({timeout: 15000});
  }
  catch(error) {
    console.log('ERROR: page reload timed out');
  }
  // Return the result.
  return {
    data,
    totals: [0, 0, Math.abs(data.discrepancy), 0],
    standardInstances: data.discrepancy ? [{
      issueID: 'focAll',
      what: 'Some focusable elements are not Tab-focusable or vice versa',
      count: Math.abs(data.discrepancy),
      ordinalSeverity: 2,
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    }] : []
  };
};
