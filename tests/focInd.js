/*
  focInd
  This test reports focusable elements without focus indicators, with non-outline focus
  indicators, and with outline focus indicators.

  It as based on the assumption that outlines are the standard and thus most familiar
  focus indicator. Other focus indicators are assumed better than none, but more likely
  to be misunderstood. For example, underlines may be mistaken for selection indicators.

  Bug: This test fails to recognize outlines when run with firefox.
*/
exports.reporter = async (page, withItems, revealAll) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/test/allVis').allVis(page);
  }
  // Get data on the focusable visible elements with and without indicators.
  const data = await page.$$eval('body *:visible', (elements, withItems) => {
    // Initialize the data.
    const data = {
      totals: {
        total: 0,
        types: {
          indicatorMissing: {
            total: 0,
            tagNames: {}
          },
          nonOutlinePresent: {
            total: 0,
            tagNames: {}
          },
          outlinePresent: {
            total: 0,
            tagNames: {}
          }
        }
      }
    };
    if (withItems) {
      data.items = {
        indicatorMissing: [],
        nonOutlinePresent: [],
        outlinePresent: []
      };
    }
    const addElementFacts = (element, status) => {
      const type = data.totals.types[status];
      type.total++;
      const tagName = element.tagName;
      if (type.tagNames[tagName]) {
        type.tagNames[tagName]++;
      }
      else {
        type.tagNames[tagName] = 1;
      }
      if (withItems) {
        data.items[status].push({
          tagName,
          text: element.textContent.trim().replace(/\s{2,}/g, ' ').slice(0, 100)
        });
      }
    };
    elements.forEach(element => {
      if (element.tabIndex === 0) {
        data.totals.total++;
        const styleBlurred = Object.assign({}, window.getComputedStyle(element));
        element.focus({preventScroll: true});
        const styleFocused = window.getComputedStyle(element);
        const hasOutline
          = styleBlurred.outlineWidth === '0px'
          && styleFocused.outlineWidth !== '0px';
        if (hasOutline) {
          addElementFacts(element, 'outlinePresent');
        }
        else {
          const diff = prop => styleFocused[prop] !== styleBlurred[prop];
          const hasIndicator
            = diff('borderStyle')
            || (styleFocused.borderStyle !== 'none' && diff('borderWidth'))
            || diff('outlineStyle')
            || (styleFocused.outlineStyle !== 'none' && diff('outlineWidth'))
            || diff('fontSize')
            || diff('fontStyle')
            || diff('textDecorationLine')
            || diff('textDecorationStyle')
            || diff('textDecorationThickness');
          const status = hasIndicator ? 'nonOutlinePresent' : 'indicatorMissing';
          addElementFacts(element, status);
        }
      }
    });
    return data;
  }, withItems);
  return {result: data};
};
