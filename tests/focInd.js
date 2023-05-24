/*
  focInd
  This test reports focusable elements without focus indicators, with non-outline focus
  indicators, and with outline focus indicators. An outline is recognized if it has non-zero
  line thickness and non-transparent color. The test is based on the assumption that outlines are
  the standard and thus most familiar focus indicator. Other focus indicators are assumed better
  than none, but more likely to be misunderstood. For example, underlines may be mistaken for
  selection indicators. Some pages delay the appearance of focus indicators. If a wait is
  specified, the test checks every 100 ms for an outline until the allow wait time expires,
  and once more after it expires. If no outline appears by then, the test checks for other focus
  indicators. If an outline does not appear immediately but appears on a subsequent check, the test
  reports the amount of the delay.

  WARNING: This test fails to recognize outlines when run with firefox.
*/
exports.reporter = async (page, revealAll, allowedDelay, withItems) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/allVis').allVis(page);
  }
  // Get data on the focusable visible elements with and without indicators.
  const data = await page.$$eval('body *:visible', async (elements, args) => {
    const allowedDelay = args[0];
    const withItems = args[1];
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
        // Get the relevant style properties and save them as the blurred styles.
        const styleBlurred = {};
        const indicatorStyleNames = [
          'outlineWidth',
          'outlineColor',
          'outlineStyle',
          'borderWidth',
          'borderStyle',
          'boxShadow',
          'fontSize',
          'fontStyle',
          'textDecorationLine',
          'textDecorationStyle',
          'textDecorationThickness'
        ];
        indicatorStyleNames.forEach(styleName => {
          styleBlurred[styleName] = styleDec[styleName];
        });
        // Focus the element, potentially changing the properties in its style declaration.
        element.focus({preventScroll: true});
        let hasOutline = false;
        // If it has no outline when not focused:
        if (styleBlurred.outlineWidth === '0px') {
          // If a non-transparent outline appeared immediately on focus:
          if (styleDec.outlineWidth !== '0px' && styleDec.outlineColor !== 'rgba(0, 0, 0, 0)') {
            // Add facts about the element to the result.
            addElementFacts(element, 'outlinePresent', 0);
            hasOutline = true;
          }
          // Otherwise, if a wait for an outline is allowed:
          else if (allowedDelay) {
            // Determine whether an outline appears and, if so, when, checking every 0.1 second.
            const outlineDelay = new Promise(resolve => {
              const focusTime = Date.now();
              const deadline = focusTime + allowedDelay;
              const interval = setInterval(() => {
                if (
                  styleDec.outlineWidth !== '0px' && styleDec.outlineColor !== 'rgba(0, 0, 0, 0)'
                ) {
                  resolve(Date.now() - focusTime);
                  clearInterval(interval);
                }
                else if (Date.now() > deadline) {
                  resolve(null);
                  clearInterval(interval);
                }
              }, 100);
            });
            // If it appeared before the deadline:
            const delay = await outlineDelay;
            if (delay) {
              // Add facts about the element to the result.
              addElementFacts(element, 'outlinePresent', delay);
              hasOutline = true;
            }
          }
        }
        // If no allowed outline appeared:
        if (! hasOutline) {
          // Returns whether a style property differs between focused and not focused.
          const diff = prop => styleDec[prop] !== styleBlurred[prop];
          // Determine whether the element has another recognized focus indicator.
          const hasDiffOutline = styleDec.outlineWidth !== '0px'
          && styleDec.outlineColor !== 'rgba(0, 0, 0, 0)'
          && (diff('outlineStyle') || diff('outlineWidth'));
          const hasDiffBorder = styleDec.borderWidth !== '0px'
          && styleDec.borderColor !== 'rgba(0, 0, 0, 0)'
          && (diff('borderStyle') || diff('borderWidth'));
          const hasIndicator
          = hasDiffOutline
          || hasDiffBorder
          || indicatorStyleNames.slice(5).reduce((any, styleName) => any || diff(styleName), false);
          // Add the determination to the result.
          const status = hasIndicator ? 'nonOutlinePresent' : 'indicatorMissing';
          addElementFacts(element, status);
        }
      }
    }
    return data;
  }, [allowedDelay, withItems]);
  const {types} = data.totals;
  const totals = [types.nonOutlinePresent.total, types.indicatorMissing.total];
  const standardInstances = [];
  if (data.items) {
    const issueNames = ['nonOutlinePresent', 'indicatorMissing'];
    issueNames.forEach(issueName => {
      data.items[issueName].forEach(item => {
        const qualifier = issueName === 'nonOutlinePresent' ? 'a non-outline' : 'no';
        standardInstances.push({
          issueID: `focInd-${issueName}`,
          what: `Element ${item.tagName} has ${qualifier} focus indicator`,
          ordinalSeverity: issueName === 'nonOutlinePresent' ? 0 : 1,
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: item.text
        });
      });
    });
  }
  return {
    data,
    totals,
    standardInstances
  };
};
