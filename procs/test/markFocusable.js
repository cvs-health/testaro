// Marks elements that can be keyboard-focused.
exports.markFocusable = async page => {

  // ## CONSTANTS

  // Navigation-key sequence. Next key after focus, refocus.
  const nextNavKeys = {
    Tab: ['ArrowRight', null],
    ArrowRight: ['ArrowDown', 'ArrowDown'],
    ArrowDown: ['ArrowDown', 'Tab']
  };
  // Maximum consecutive external foci (1 suffices for Chrome).
  const externalLimit = 3;

  // ## VARIABLES

  let lastNavKey = 'Tab';
  let externalCount = 0;

  // ## FUNCTIONS

  // Marks and returns the focused in-body element or returns a status.
  const {focusMark} = require('./focusMark');
  // Recursively focuses and marks elements.
  const markAll = async () => {
    // Identify and mark the newly focused element or identify a status.
    const focOrStatus = await focusMark(page, lastNavKey);
    // If the status is external:
    if (focOrStatus === 'external') {
      // Press the Tab key, or quit if the external limit has been reached.
      if (externalCount++ < externalLimit) {
        await page.keyboard.press(lastNavKey = 'Tab');
      }
    }
    // Otherwise, i.e. if an element was focused or refocused:
    else {
      // Identify the next navigation key to be pressed.
      const nextKey = nextNavKeys[lastNavKey][focOrStatus === 'already' ? 1 : 0];
      // If it exists:
      if (nextKey) {
        // Press it.
        await page.keyboard.press(lastNavKey = nextKey);
        // Process the element focused by that keypress.
        await markAll();
      }
    }
  };

  // ### OPERATION

  //
  // Press the Tab key and identify it as the last-pressed navigation key.
  await page.keyboard.press('Tab');
  // Recursively focus and mark elements.
  await markAll();
};
