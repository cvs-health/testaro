// Returns counts, and texts if required, of focusable elements with and without indicators.
exports.reporter = async (page, withItems, revealAll) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/test/allVis').allVis(page);
  }
  // Get data on the focusable visible elements with and without indicators.
  return {result: await page.$$eval('body *:visible', (elements, withItems) => {
    // Initialize the data.
    const data = {
      totals: {
        total: 0,
        types: {
          indicatorMissing: {
            total: 0,
            tagNames: {}
          },
          indicatorPresent: {
            total: 0,
            tagNames: {}
          }
        }
      }
    };
    if (withItems) {
      data.items = {
        indicatorMissing: [],
        indicatorPresent: []
      };
    }
    elements.forEach(element => {
      if (element.tabIndex === 0) {
        data.totals.total++;
        const styleBlurred = Object.assign({}, window.getComputedStyle(element));
        element.focus({preventScroll: true});
        const styleFocused = window.getComputedStyle(element);
        const diff = prop => styleFocused[prop] !== styleBlurred[prop];
        const hasInd
          = diff('borderStyle')
          || (styleFocused.borderStyle !== 'none' && diff('borderWidth'))
          || diff('outlineStyle')
          || (styleFocused.outlineStyle !== 'none' && diff('outlineWidth'))
          || diff('fontSize')
          || diff('fontStyle')
          || diff('textDecorationLine')
          || diff('textDecorationStyle')
          || diff('textDecorationThickness');
        const type = data.totals.types[hasInd ? 'indicatorPresent' : 'indicatorMissing'];
        type.total++;
        const tagName = element.tagName;
        if (type.tagNames[tagName]) {
          type.tagNames[tagName]++;
        }
        else {
          type.tagNames[tagName] = 1;
        }
        if (withItems) {
          data.items[type].push({
            tagName,
            text: element.textContent.trim().replace(/\s{2,}/g, ' ').slice(0, 100)
          });
        }
      }
    });
    return data;
  }, withItems)};
};
