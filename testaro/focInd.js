/*
  focInd

  This test reports focusable elements without standard focus indicators. The standard focus
  indicator is deemed to be a solid outline with a line thickness of at least 2 pixels and a
  non-transparent color, and only if the element, when not focused, has no outline.

  The focus indicator is checked immediately after the element is focused. Thus, a delayed focus
  indicator is ignored. Indication delayed is treated as indication denied. The bases for this
  treatment are that delayed indication interferes with rapid human or mechanized document
  consumption and also, if it must be respected, slows accessibility testing.

  Solid outlines are the standard and thus most familiar focus indicator. Other focus indicators
  are likely to be misunderstood. For example, underlines may be mistaken for selection or link
  indicators.

  WARNING: This test fails to recognize outlines when run with firefox.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(page, 'body *:visible');
  all.result.data.focusableCount = 0;
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element is focusable.
    const isFocusable = await loc.evaluate(el => el.tabIndex === 0);
    // If it is:
    if (isFocusable) {
      // Add this to the report.
      all.result.data.focusableCount++;
      // Get whether it has a nonstandard focus indicator.
      const hasBadIndicator = await loc.evaluate(el => {
        // Get the live style declaration of the element.
        const styleDec = window.getComputedStyle(el);
        // If the element has an outline:
        if (styleDec.outlineWidth !== '0px') {
          // Return a violation.
          return 'an outline when blurred';
        }
        // Otherwise, i.e. if the element has no outline:
        else {
          // Focus the element.
          el.focus({preventScroll: true});
          // If it now has no standard outline:
          if (
            Number.parseFloat(styleDec.outlineWidth) < 2
            || styleDec.outlineColor === 'rgba(0, 0, 0, 0)'
            || styleDec.outlineStyle !== 'solid'
          ) {
            // Return a violation.
            return 'no standard focus outline';
          }
          // Otherwise, i.e. if the element now has a standard outline:
          else {
            // Return conformance.
            return false;
          }
        }
      });
      // If it does:
      if (hasBadIndicator) {
        // Add the locator to the array of violators.
        all.locs.push([loc, hasBadIndicator]);
      }
    }
  }
  // Populate and return the result.
  const whats = ['Element has __param__', 'Elements fail to have standard focus indicators'];
  return await report(withItems, all, 'focInd', whats, 1);
};
