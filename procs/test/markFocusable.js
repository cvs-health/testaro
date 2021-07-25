// Marks elements that can be keyboard-focused.
exports.markFocusable = async page => {

  // ## CONSTANTS

  // Maximum consecutive external foci (1 suffices for Chrome).
  const externalLimit = 2;

  // ## VARIABLES

  let lastNavKey = 'Tab';
  let externalCount = 0;

  // ## FUNCTIONS

  // Determines the next navigation key.
  const nextNavKey = async (lastNavKey, focus, status) => await page.evaluate(args => {
    const lastNavKey = args[0];
    const focus = args[1];
    const status = args[2];
    // If the focal element had been focused before:
    if (status === 'already') {
      if (lastNavKey === 'ArrowDown' && focus.getAttribute('role') === 'menuitem') {
        return 'Escape';
      }
      else if (
        lastNavKey === 'Escape'
        && focus.getAttribute('role') === 'menuitem'
        && ['true', 'menu'].includes(focus.ariaHasPopup)
      ) {
        return 'ArrowRight';
      }
      else if (
        lastNavKey === 'ArrowDown' && focus.tagName === 'INPUT' && focus.type === 'radio'
      ) {
        return 'Tab';
      }
      else if (lastNavKey === 'ArrowRight') {
        return 'Tab';
      }
      else {
        return null;
      }
    }
    // Otherwise, i.e. if the focal element has been newly focused:
    else {
      if (lastNavKey === 'Tab') {
        if (['true', 'menu'].includes(focus.ariaHasPopup)) {
          return 'ArrowDown';
        }
        else if (focus.tagName === 'INPUT' && focus.type === 'radio') {
          return 'ArrowDown';
        }
        else {
          return 'Tab';
        }
      }
      else if (lastNavKey === 'ArrowDown') {
        if (['true', 'menu'].includes(focus.ariaHasPopup)) {
          return 'ArrowRight';
        }
        else {
          return 'ArrowDown';
        }
      }
      else if (lastNavKey === 'ArrowRight') {
        return 'ArrowDown';
      }
      else {
        return 'Tab';
      }
    }
  }, [lastNavKey, focus, status]);
  // Marks and returns the focused in-body element, if any, and a status.
  const {focusMark} = require('./focusMark');
  // Recursively focuses and marks elements.
  const markAll = async () => {
    // Identify and mark the newly focused element, if any, and identify the status.
    const focusAndStatus = await focusMark(page, lastNavKey);
    // If the status is external:
    if (focusAndStatus[1] === 'external') {
      // If the external limit has not been reached:
      if (externalCount++ < externalLimit) {
        // Press the Tab key.
        await page.keyboard.press(lastNavKey = 'Tab');
        // Process the element focused by that keypress.
        await markAll();
      }
    }
    // Otherwise, i.e. if the status is new or already:
    else {
      // Identify the next navigation key to be pressed.
      const nextKey = await nextNavKey(lastNavKey, ...focusAndStatus);
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
  // Mark as focusable all other elements whose pseudofocus is managed.
  await page.evaluate(() => {
    const managees = document.body.querySelectorAll(
      '[aria-activedescendant] [role=menuitem]:not([data-autotest-focused])'
    );
    managees.forEach(managee => {
      managee.dataset.autotestFocused = 'Pseudo';
    });
  });
};
