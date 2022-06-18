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
    await require('../procs/allVis').allVis(page);
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
    // Add facts about an element to the result.
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
    // For each visible element descendant of the body:
    elements.forEach(element => {
      // If it is Tab-focusable:
      if (element.tabIndex === 0) {
        // Increment the total of focusable elements.
        data.totals.total++;
        // Get its style properties when not focused.
        const styleBlurred = Object.assign({}, window.getComputedStyle(element));
        // Focus it.
        element.focus({preventScroll: true});
        // Get its style properties when focused.
        const styleFocused = window.getComputedStyle(element);
        // Determine whether it has an outline when and only when focused.
        const hasOutline
        = styleBlurred.outlineWidth === '0px'
        && styleFocused.outlineWidth !== '0px';
        // If so:
        if (hasOutline) {
          // Add this to the result.
          addElementFacts(element, 'outlinePresent');
        }
        // Otherwise:
        else {
          // Returns whether one of its style properties differs between focused and not focused.
          const diff = prop => styleFocused[prop] !== styleBlurred[prop];
          // Determine whether it has another focus indicator deemed valid.
          const hasIndicator
          = diff('borderStyle')
          && styleBlurred.borderWidth !== '0px'
          && styleFocused.borderWidth !== '0px'
          || (styleFocused.borderStyle !== 'none' && diff('borderWidth'))
          || diff('outlineStyle')
          && styleBlurred.outlineWidth !== '0px'
          && styleFocused.outlineWidth !== '0px'
          || (styleFocused.outlineStyle !== 'none' && diff('outlineWidth'))
          || diff('fontSize')
          || diff('fontStyle')
          || diff('textDecorationLine')
          || diff('textDecorationStyle')
          || diff('textDecorationThickness');
          // Add the determination to the result.
          const status = hasIndicator ? 'nonOutlinePresent' : 'indicatorMissing';
          addElementFacts(element, status);
        }
      }
    });
    return data;
  }, withItems);
  return {result: data};
};
