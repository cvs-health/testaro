// Tabulates focusable and operable elements.
exports.reporter = async page => {
  // Mark the focusable elements.
  await require('../../procs/test/markFocusable').markFocusable(page);
  // Mark the operable elements.
  await require('../../procs/test/markOperable').markOperable(page);
  // Get an array of the elements that are focusable but not operable.
  const fNotO = await page.$$('[data-autotest-focused]:not([data-autotest-operable])');
  // Get an array of the elements that are operable but not focusable.
  const oNotF = await page.$$('[data-autotest-operable]:not([data-autotest-focused])');
  // Get an array of the elements that are focusable and operable.
  const fAndO = await page.$$('[data-autotest-focused][data-autotest-operable]');
  // Gets the tag name of an element.
  const tag = async element => {
    const tagNameJSHandle = await element.getProperty('tagName');
    return await tagNameJSHandle.jsonValue();
  };
  // Tallies an array.
  const tally = tagNames => {
    const result = {};
    tagNames.forEach(tagName => {
      if (result[tagName]) {
        result[tagName]++;
      }
      else {
        result[tagName] = 1;
      }
    });
    return result;
  };
  const fNotOTags = await Promise.all(fNotO.map(element => tag(element)));
  const oNotFTags = await Promise.all(oNotF.map(element => tag(element)));
  const fAndOTags = await Promise.all(fAndO.map(element => tag(element)));
  return {
    result: {
      operableButNotFocusable: {
        total: oNotFTags.length,
        tagNames: tally(oNotFTags)
      },
      focusableButNotOperable: {
        total: fNotOTags.length,
        tagNames: tally(fNotOTags)
      },
      focusableAndOperable: {
        total: fAndOTags.length,
        tagNames: tally(fAndOTags)
      }
    }
  };
};
