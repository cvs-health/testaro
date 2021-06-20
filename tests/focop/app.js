// Tabulates and lists focusable and operable elements.
exports.reporter = async page => {
  // Import a module to get the texts of an element.
  const {allText} = require('../../procs/test/allText');
  // Mark the focusable elements.
  await require('../../procs/test/markFocusable').markFocusable(page);
  // Mark the operable elements.
  await require('../../procs/test/markOperable').markOperable(page);
  // Get an array of the elements that are focusable but not operable.
  const fNotO = await page.$$('[data-autotest-focused]:not([data-autotest-operable])');
  // Get an array of the elements that are operable but not focusable.
  const oNotF = await page.$$('[data-autotest-operable]:not([data-autotest-focused])');
  // Get an array of the elements that are focusable and operable.
  const fAndO = await page.$$('[data-autotest-focused][data-autotest-operable])');
  // Gets the tag name and texts of an element.
  const tagAndText = async element => {
    const tagNameJSHandle = await element.getProperty('tagName');
    const tagName = await tagNameJSHandle.jsonValue();
    const text = await allText(element);
    return {
      tagName,
      text
    };
  };
  const fNotOTexts = fNotO.map(element => tagAndText(element));
  const oNotFTexts = oNotF.map(element => tagAndText(element));
  const fAndOTexts = fAndO.map(element => tagAndText(element));
  return {
    result: {
      operableButNotFocusable: oNotFTexts,
      focusableButNotOperable: fNotOTexts,
      focusableAndOperable: fAndOTexts
    }
  };
};
