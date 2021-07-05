// Returns counts, and texts if required, of elements with and without focal outlines.
exports.focusOutline = async (page, withTexts) => {

  // CONSTANTS

  // Navigation-key sequence.
  const nextNavKeys = {
    Tab: ['ArrowRight', null],
    ArrowRight: ['ArrowRight', 'ArrowDown'],
    ArrowDown: ['ArrowDown', 'Tab']
  };

  // VARIABLES

  let lastNavKey = 'Tab';
  // Result properties.
  let focusableCount = 0;
  let outlinedCount = 0;
  const outlinedTexts = [];
  const plainTexts = [];

  // FUNCTIONS

  const allText = withTexts ? require('./allText').allText : '';
  const {focusMark} = require('./focusMark');
  // Recursively reports on focus outlines.
  const reportOutlines = async () => {
    // Identify and mark the newly focused element or report a failure.
    const focus = await focusMark(page, lastNavKey);
    // Identify the failure status, if any.
    const failure = typeof focus === 'string' ? focus : null;
    // If it is a refocused element and the last navigation key was an arrow key:
    if (failure === 'already' && ['ArrowRight', 'ArrowDown'].includes(lastNavKey)) {
      // Press the next post-failure navigation key.
      await page.keyboard.press(lastNavKey = nextNavKeys[lastNavKey][1]);
      // Process the element focused by that keypress.
      await reportOutlines();
    }
    // Otherwise, if there is no failure:
    else if (! failure) {
      // Get the text of the newly focused element if necessary.
      const focusText = withTexts ? await allText(page, focus) : '';
      // Determine whether it is outlined when focused.
      const verdict = await page.evaluate(focus => {
        const outlineWidth = window.getComputedStyle(focus).outlineWidth;
        return outlineWidth === '0px' ? 0 : 1;
      }, focus);
      // Increment the applicable counts.
      focusableCount++;
      outlinedCount += verdict;
      if (withTexts) {
        if (verdict) {
          outlinedTexts.push(focusText);
        }
        else {
          plainTexts.push(focusText);
        }
      }
      // Press the next post-success navigation key.
      await page.keyboard.press(lastNavKey = nextNavKeys[lastNavKey][0]);
      // Process the element focused by that keypress.
      await reportOutlines();
    }
  };

  // OPERATION

  // Press the Tab key.
  await page.keyboard.press('Tab');
  // Report the focus outlines.
  await reportOutlines();
  // Return the result.
  const data = {
    focusableCount,
    outlinedCount,
    outlinedPercent: Math.floor(100 * outlinedCount / focusableCount)
  };
  if (withTexts) {
    data.outlinedTexts = outlinedTexts;
    data.plainTexts = plainTexts;
  }
  return data;
};
