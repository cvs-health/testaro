// Returns counts, and texts if required, of focusable elements with and without indicators.
exports.reporter = async (page, withItems, revealAll) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/test/allVis').allVis(page);
  }
  // Get data on the focusable visible elements with and without indicators.
  return {result: await page.$$eval('body *:visible', elements => {
    // Initialize the data.
    const data = [];
    elements.forEach(element => {
      if (element.tabIndex === 0) {
        const styleBlurred = Object.assign({}, window.getComputedStyle(element));
        element.focus({preventScroll: true});
        const styleFocused = window.getComputedStyle(element);
        const diff = prop => styleFocused[prop] !== styleBlurred[prop];
        const datum = {
          indicator: diff('borderStyle')
            || (styleFocused.borderStyle !== 'none' && diff('borderWidth'))
            || diff('outlineStyle')
            || (styleFocused.outlineStyle !== 'none' && diff('outlineWidth'))
            || diff('fontSize')
            || diff('fontStyle')
            || diff('textDecorationLine')
            || diff('textDecorationStyle')
            || diff('textDecorationThickness'),
          tagName: element.tagName
        };
        if (withItems) {
          datum.text = element.textContent.trim().slice(0, 100);
        }
        data.push(datum);
      }
    });
    return data;
  })};
};
