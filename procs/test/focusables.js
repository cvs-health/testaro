// Finds and operates on elements that can be keyboard-focused.
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

  // Determines the next navigation key.
  const nextNavKey = async (lastNavKey, focus, status) => await page.evaluate(args => {
    const lastNavKey = args[0];
    const focus = args[1];
    const status = args[2];
    // If the focal element had been focused before, return:
    if (status === 'already') {
      // If the focus is on a menu item:
      if (focus.getAttribute('role') === 'menuitem') {
        // Escape if the last key navigated vertically.
        if (lastNavKey === 'ArrowDown') {
          return 'Escape';
        }
        // ArrowRight if the last key tried (successfully or not) to close a menu.
        else if (lastNavKey === 'Escape') {
          return 'ArrowRight';
        }
        // Tab if the last key tried (successfully or not) to navigate horizontally.
        else if (lastNavKey === 'ArrowRight') {
          return 'Tab';
        }
      }
      // Tab if the last key navigated within a non-menu widget.
      else if (['ArrowDown', 'ArrowRight'].includes(lastNavKey)) {
        return 'Tab';
      }
      // Null otherwise, to stop the navigation.
      else {
        return null;
      }
    }
    // Otherwise, i.e. if the focal element is newly focused, return:
    else {
      // ArrowDown if the focus is on a radio button.
      if (focus.tagName === 'INPUT' && focus.type === 'radio') {
        return 'ArrowDown';
      }
      // ArrowDown if the focus is on a menu button.
      else if (['menu', 'true'].includes(focus.ariaHasPopup)) {
        return 'ArrowDown';
      }
      // ArrowDown or ArrowRight if the focus is on another menu item.
      else if (focus.getAttribute('role') === 'menuitem') {
        // Returns the role of the menu that a menu item is an item of.
        const owningMenuRole = menuItem => {
          const parent = menuItem.parentElement;
          const parentRole = parent.getAttribute('role');
          if (parentRole.startsWith('menu')){
            return parentRole;
          }
          else {
            const grandparent = parent.parentElement;
            const grandparentRole = grandparent.getAttribute('role');
            if (grandparentRole.startsWith('menu')) {
              return grandparentRole;
            }
            else {
              return '';
            }
          }
        };
        const menuRole = owningMenuRole(focus);
        if (menuRole === 'menu') {
          return 'ArrowDown';
        }
        else if (menuRole === 'menubar') {
          return 'ArrowRight';
        }
        else {
          return 'Tab';
        }
      }
      // Tab otherwise.
      else {
        return 'Tab';
      }
    }
  }, [lastNavKey, focus, status]);
  // Recursively focuses elements and performs an operation on them.
  const opAll = async () => {
    // Identify and operate on the newly focused element, if any, and return it and a status.
    const focusAndStatus = await op(page, lastNavKey);
    const focus = focusAndStatus[0];
    const status = focusAndStatus[1];
    // If the status is external:
    if (status === 'external') {
      // If the external limit has not been reached, increment the count and:
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
      const nextKey = await nextNavKey(lastNavKey, focus, status);
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

  // Press the Tab key.
  await page.keyboard.press(lastNavKey);
  // Recursively focus and operate on elements.
  await opAll();
};
