// Finds and operates on elements that can be keyboard-focused (not pseudofocused).
exports.focusables = async (page, operation) => {

  // ## IMPORTS

  const op = require(`./${operation}`)[operation];

  // ## CONSTANTS

  // Maximum consecutive external foci (1 suffices for Chrome).
  const externalLimit = 2;

  // ## VARIABLES

  let lastNavKey = 'Tab';
  let externalCount = 0;

  // ## FUNCTIONS

  // Recursively returns the type of menu an element is a descendant of.
  const inMenuType = element => {
    if (element === document.body) {
      return null;
    }
    else {
      const parent = element.parentElement;
      const parentRole = parent.getAttribute('role');
      if (['menu', 'menubar'].includes(parentRole)) {
        return parentRole;
      }
      else {
        return inMenuType(parent);
      }
    }
  };
  // Determines the next navigation key.
  const nextNavKey = async (lastNavKey, focus, status) => await page.evaluate(args => {
    const lastNavKey = args[0];
    const focus = args[1];
    const status = args[2];
    // If the focal element had been focused before:
    if (status === 'already') {
      // Return Tab if the focus is on a widget item, or null otherwise.
      return ['ArrowDown', 'ArrowRight'].includes(lastNavKey) ? 'Tab' : null;
    }
    // Otherwise, i.e. if the focal element has been newly focused:
    else {
      // If it is a radio button, menu button, or vertical menu item, return ArrowDown.
      if (
        focus.tagName === 'INPUT' && focus.type === 'radio'
        || ['menu', 'true'].includes(focus.ariaHasPopup)
        || focus.getAttribute('role') === 'menuitem' && inMenuType(focus) === 'menu'
      ) {
        return 'ArrowDown';
      }
      // Otherwise, if it is a horizontal menu item, return ArrowRight.
      else if (focus.getAttribute('role') === 'menuitem' && inMenuType(focus) === 'menubar') {
        return 'ArrowRight';
      }
      // Otherwise, return Tab.
      else {
        return 'Tab';
      }
    }
  }, [lastNavKey, focus, status]);
  // Recursively focuses elements and performs the operation on them.
  const opAll = async () => {
    // Identify and operate on the newly focused element, if any, and identify the status.
    const focusAndStatus = await op(page, lastNavKey);
    // If the status is external:
    if (focusAndStatus[1] === 'external') {
      // If the external limit has not been reached:
      if (externalCount++ < externalLimit) {
        // Press the Tab key.
        await page.keyboard.press(lastNavKey = 'Tab');
        // Process the element focused by that keypress.
        await opAll();
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
        await opAll();
      }
    }
  };

  // ### OPERATION

  // Press the Tab key and identify it as the last-pressed navigation key.
  await page.keyboard.press('Tab');
  // Recursively focus and operate on elements.
  await opAll();
};
