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

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems, revealAll = false, allowedDelay = 250) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/allVis').allVis(page);
  }
  // Define the severities of inferior indicators.
  const ordinalSeverities = {
    other: 2,
    none: 3
  };
  // Define the descriptors of inferior indicators.
  const adjectives = {
    other: 'a non-outline',
    none: 'no'
  };
  // Get a locator of all visible elements.
  const locAll = page.locator('body *:visible');
  // Get locators of those that are focusable.
  const locsAll = await locAll.all();
  const locs = [];
  for (const loc of locsAll) {
    const isTabFocusable = await loc.evaluate(element => element.tabIndex === 0);
    if (isTabFocusable) {
      locs.push(loc);
    }
  }
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // For each of them:
  for (const loc of locs) {
    // Get data on its focus indication.
    const indication = await loc.evaluate(async (element, allowedDelay) => {
      const otherStyleNames = [
        'boxShadow',
        'fontSize',
        'fontStyle',
        'textDecorationLine',
        'textDecorationStyle',
        'textDecorationThickness'
      ];
      const allStyleNames = otherStyleNames.concat([
        'outlineWidth',
        'outlineStyle',
        'outlineColor',
        'borderWidth',
        'borderStyle',
        'borderColor'
      ]);
      // FUNCTIONS DEFINITION START
      // Returns whether an enclosure indicates focus.
      const boxDiffers = (boxName, blurredStyleDec, focusedStyleDec) => {
        const anyThick = blurredStyleDec[`${boxName}Width`] !== '0px'
        || focusedStyleDec[`${boxName}Width`] !== '0px';
        const anyDiff = ['Width', 'Style', 'Color'].some(
          type => blurredStyleDec[`${boxName}${type}`] !== focusedStyleDec[`${boxName}${type}`]
        );
        return anyThick && anyDiff;
      };
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
          // Return whether there is another focus indicator.
          const outlineDiffers = boxDiffers('outline', blurredStyleDec, focusedStyleDec);
          const borderDiffers = boxDiffers('border', blurredStyleDec, focusedStyleDec);
          const otherDiffers = otherStyleNames.some(
            styleName => focusedStyleDec[styleName] !== blurredStyleDec[styleName]
          );
          return (outlineDiffers || borderDiffers || otherDiffers) ? 'other' : 'none';
        }
      };
      const pollIndicator = async (blurredStyleDec, focusedStyleDec, allowedDelay) => {
        // If there is a focus indicator:
        const instantIndicator = getIndicator(blurredStyleDec, focusedStyleDec);
        if (instantIndicator !== 'none') {
          // Return its type.
          return instantIndicator;
        }
        // Otherwise, i.e. if there is no focus indicator:
        else {
          // Check for a focus indicator periodically until the deadline and return the result.
          const deadline = Date.now() + allowedDelay + 100;
          let indicator = new Promise(resolve => {
            const poller = setInterval(() => {
              if (Date.now() > deadline) {
                resolve('none');
                clearInterval(poller);
              }
              else {
                const trialIndicator = getIndicator(blurredStyleDec, focusedStyleDec);
                if (trialIndicator !== 'none') {
                  resolve(trialIndicator);
                  clearInterval(poller);
                }
              }
            }, 100);
          });
          return await indicator;
        }
      };
      // FUNCTIONS DEFINITION END
      // Get a live style declaration for the element.
      const styleDec = window.getComputedStyle(element);
      // Get the relevant style properties and save them as the blurred styles.
      const blurredStyleDec = {};
      allStyleNames.forEach(styleName => blurredStyleDec[styleName] = styleDec[styleName]);
      // Focus the element, potentially changing the properties in its style declaration.
      element.focus({preventScroll: true});
      // Return the type of its focus indicator.
      return await pollIndicator(blurredStyleDec, styleDec, allowedDelay);
    }, allowedDelay);
    // If the indicator is inferior:
    if (indication !== 'outline') {
      // Add this to the result.
      totals[ordinalSeverities[indication]]++;
      if (withItems) {
        const elData = await getLocatorData(loc);
        standardInstances.push({
          ruleID: 'focInd',
          what: `Element has ${adjectives[indication]} focus indicator`,
          ordinalSeverity: ordinalSeverities[indication],
          tagName: elData.tagName,
          id: elData.id || '',
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
  }
  // If itemization is not required:
  if (! withItems) {
    // Add summary instances to the standard result.
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
