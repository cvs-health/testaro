/*
  focInd
  This test reports focusable elements without focus indicators, with non-outline focus
  indicators, and with outline focus indicators. It as based on the assumption that outlines are
  the standard and thus most familiar focus indicator. Other focus indicators are assumed better
  than none, but more likely to be misunderstood. For example, underlines may be mistaken for
  selection indicators. Some pages delay the appearance of focus indicators. This test waits for
  focus indicators to appear if specified and, if there is a delay, reports on its magnitude.

  Bug: This test fails to recognize outlines when run with firefox.
*/
exports.reporter = async (page, revealAll, allowedDelay, withItems) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/allVis').allVis(page);
  }
  // Get data on the focusable visible elements with and without indicators.
  const data = await page.$$eval('body *:visible', async (elements, withItems) => {
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
            meanDelay: 0,
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
    // Adds facts about an element to the result.
    const addElementFacts = (element, status, delay = null) => {
      const type = data.totals.types[status];
      type.total++;
      if (status === 'outlinePresent') {
        type.meanDelay = Math.round(((type.total - 1) * type.meanDelay + delay) / type.total);
      }
      const tagName = element.tagName;
      if (type.tagNames[tagName]) {
        type.tagNames[tagName]++;
      }
      else {
        type.tagNames[tagName] = 1;
      }
      if (withItems) {
        const elementData = {
          tagName,
          text: element.textContent.trim().replace(/\s{2,}/g, ' ').slice(0, 100)
        };
        if (status === 'outlinePresent') {
          elementData.delay = delay;
        }
        data.items[status].push(elementData);
      }
    };
    // For each visible element descendant of the body:
    for(const element of elements) {
      // If it is Tab-focusable:
      if (element.tabIndex === 0) {
        // Increment the total of focusable elements.
        data.totals.total++;
        // Get a live style declaration of its properties.
        const styleDec = window.getComputedStyle(element);
        // Freeze a copy to preserve the style properties when not focused.
        const styleBlurred = Object.assign({}, styleDec);
        // Focus it, potentially changing the properties in its style declaration.
        element.focus({preventScroll: true});
        let hasOutline = false;
        // If it has no outline when not focused:
        if (styleBlurred.outlineWidth === '0px') {
          // If an outline appeared immediately on focus:
          if (styleDec.outlineWidth !== '0px') {
            // Add facts about the element to the result.
            addElementFacts(element, 'outlinePresent', 0);
            hasOutline = true;
          }
          // Otherwise, if a wait for an outline is allowed:
          else if (allowedDelay) {
            // Determine how long an outline takes to appear or whether it times out.
            const outlineDelay = new Promise(resolve => {
              const focusTime = Date.now();
              const deadline = focusTime + allowedDelay;
              const interval = setInterval(() => {
                if (styleDec.outlineWidth !== '0px') {
                  resolve(Date.now() - focusTime);
                  clearInterval(interval);
                }
                else if (Date.now() > deadline) {
                  resolve(null);
                  clearInterval(interval);
                }
              }, 100);
            });
            // If it appeared before the wait limit:
            if (await outlineDelay) {
              // Add facts about the element to the result.
              addElementFacts(element, 'outlinePresent', outlineDelay);
              hasOutline = true;
            }
          }
        }
        // If no outline was allowed:
        if (! hasOutline) {
          // Returns whether a style property differs between focused and not focused.
          const diff = prop => styleDec[prop] !== styleBlurred[prop];
          // Determine whether the element has another allowed focus indicator.
          const hasIndicator
          = diff('borderStyle')
          && styleBlurred.borderWidth !== '0px'
          && styleDec.borderWidth !== '0px'
          || (styleDec.borderStyle !== 'none' && diff('borderWidth'))
          || diff('outlineStyle')
          && styleBlurred.outlineWidth !== '0px'
          && styleDec.outlineWidth !== '0px'
          || (styleDec.outlineStyle !== 'none' && diff('outlineWidth'))
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
    };
    return data;
  }, withItems);
  return {result: data};
};
