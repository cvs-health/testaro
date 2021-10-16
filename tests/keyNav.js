// Returns successes and failures of keyboard navigation.
exports.reporter = async (page, withItems, revealAll) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/test/allVis').allVis(page);
  }
  // Get the elements.
  const elements = await page.$$('body *:visible');
  const focusables = await Promise.all(elements.filter(async element => {
    const tabIndexJSHandle = element.getProperty('tabIndex');
    const tabIndex = await tabIndexJSHandle.jsonValue();
    return tabIndex === 0;
  }));
  return focusables;
};
/*
  Strategy: tabNav, menuNav, radioNav, modalNav, keyNav.
  These will replace focOp.
*/
