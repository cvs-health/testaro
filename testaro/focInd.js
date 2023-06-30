/*
  focInd
  This test reports focusable elements without focus indicators and with non-outline focus
  indicators. An outline is recognized if it has non-zero line thickness and non-transparent color.
  The test is based on the assumption that outlines are the standard and thus most familiar focus
  indicator. Other focus indicators are assumed better than none, but more likely to be
  misunderstood. For example, underlines may be mistaken for selection indicators. Some pages delay
  the appearance of focus indicators. If a wait is specified, the test checks every 100 ms for an
  outline until the allowed wait time expires, and once more after it expires. If no outline appears
  by then, the test checks for other focus indicators.

  WARNING: This test fails to recognize outlines when run with firefox.
*/
exports.reporter = async (page, withItems, revealAll = false, allowedDelay = 250) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/allVis').allVis(page);
  }
  // Get data on the focus indicators of the focusable visible elements.
  const [data, totals, standardInstances] = await page
  .$$eval('body *:visible', async (elements, args) => {
    const allowedDelay = args[0];
    const withItems = args[1];
    // Initialize the data.
    const data = {};
    const totals = [0, 0, 0, 0];
    const standardInstances = [];
    const outlineStyleNames = [
      'outlineWidth',
      'outlineStyle',
      'outlineColor'
    ];
    const otherStyleNames = [
      'borderWidth',
      'borderStyle',
      'boxShadow',
      'fontSize',
      'fontStyle',
      'textDecorationLine',
      'textDecorationStyle',
      'textDecorationThickness'
    ];
    const ordinalSeverities = {
      other: 2,
      none: 3
    };
    const adjectives = {
      other: 'a non-outline',
      none: 'no'
    };
    const indicatorStyleNames = outlineStyleNames.concat(otherStyleNames);
    // FUNCTION DEFINITIONS START
    // Returns a space-minimized copy of a string.
    const compact = string => string
    .replace(/[\t\n]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 100);
    // Returns the type of focus indicator of an element.
    const getIndicator = (blurredStyleDec, focusedStyleDec) => {
      // If there is no outline on blur but there is on focus:
      if (
        blurredStyleDec.outlineWidth === '0px'
        && focusedStyleDec.outlineWidth !== '0px'
        && focusedStyleDec.outlineColor !== 'rgba(0, 0, 0, 0)'
      ) {
        // Return this.
        return 'outline';
      }
      // Otherwise, i.e. if there is no outline focus indicator:
      else {
        // If there is a non-outline focus indicator:
        return indicatorStyleNames.some(
          styleName => focusedStyleDec[styleName] !== blurredStyleDec[styleName]
        ) ? 'other' : 'none';
      }
    };
    const pollIndicator = async (blurredStyleDec, focusedStyleDec, allowedDelay) => {
      // If there is a focus indicator:
      const instantIndicator = getIndicator(blurredStyleDec, focusedStyleDec);
      if (instantIndicator) {
        // Return its type.
        return instantIndicator;
      }
      // Otherwise, i.e. if there is no focus indicator:
      else {
        // Check for a focus indicator periodically until the deadline and return the result.
        const deadline = Date.now() + allowedDelay + 100;
        let indicator = new Promise('none');
        const poller = setInterval(() => {
          if (Date.now() > deadline) {
            Promise.resolve(indicator);
            clearInterval(poller);
          }
          else {
            indicator = getIndicator(blurredStyleDec, focusedStyleDec);
            if (indicator) {
              Promise.resolve(indicator);
              clearInterval(poller);
            }
          }
        }, 100);
        return await indicator;
      }
    };
    // FUNCTION DEFINITIONS END
    // For each visible element descendant of the body:
    for(const element of elements) {
      // If it is Tab-focusable:
      if (element.tabIndex === 0) {
        // Get a live style declaration of its properties.
        const styleDec = window.getComputedStyle(element);
        // Get the relevant style properties and save them as the blurred styles.
        const blurredStyleDec = {};
        indicatorStyleNames.forEach(styleName => {
          blurredStyleDec[styleName] = styleDec[styleName];
        });
        // Focus the element, potentially changing the properties in its style declaration.
        element.focus({preventScroll: true});
        // If it has an inferior focus indicator:
        const indicator = pollIndicator(blurredStyleDec, styleDec, allowedDelay);
        if (indicator !== 'outline') {
          // Add this to the result.
          totals[ordinalSeverities[indicator]]++;
          if (withItems) {
            standardInstances.push({
              ruleID: 'focInd',
              what: `Element has ${adjectives[indicator]} focus indicator`,
              ordinalSeverity: ordinalSeverities[indicator],
              tagName: element.tagName,
              id: element.id || '',
              location: {
                doc: '',
                type: '',
                spec: ''
              },
              excerpt: compact(element.textContent) || compact(element.outerHTML)
            });
          }
        }
      }
    }
    // If summary instances are required:
    if (! withItems) {
      // Add them to the result.
      if (totals[2]) {
        standardInstances.push({
          ruleID: 'focInd',
          what: 'Elements have non-outline focus indicators',
          ordinalSeverity: 2,
          count: totals[2],
          tagName: '',
          id: '',
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: ''
        });
      }
      if (totals[3]) {
        standardInstances.push({
          ruleID: 'focInd',
          what: 'Elements have no focus indicators',
          ordinalSeverity: 3,
          count: totals[3],
          tagName: '',
          id: '',
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: ''
        });
      }
    }
    return [data, totals, standardInstances];
  }, [allowedDelay, withItems]);
  // Reload the page.
  try {
    await page.reload({timeout: 15000});
  }
  catch(error) {
    console.log('ERROR: page reload timed out');
  }
  return {
    data,
    totals,
    standardInstances
  };
};
