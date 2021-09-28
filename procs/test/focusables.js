// Finds and operates on elements that can be keyboard-focused.
exports.focusables = async (page, operation) => {

  // ## IMPORTS

  const op = require(`./${operation}`)[operation];

  // ## CONSTANTS

  // Maximum consecutive external foci (1 suffices for Chrome).
  const externalLimit = 2;
  // Maximum count of repeated foci.
  const alreadyLimit = 3;

  // ## VARIABLES

  let lastNavKey = 'Tab';
  let externalCount = 0;
  let alreadyCount = 0;

  // ## FUNCTIONS

  // Determines the next navigation key.
  const nextNavKey = async (lastNavKey, focus, status) => await page.evaluate(args => {
    const lastNavKey = args[0];
    const focus = args[1];
    const status = args[2];
    const role = focus.getAttribute('role');
    // If the focal element had been focused before, return:
    if (status === 'already') {
      // If the focus is on a menu item:
      if (role === 'menuitem') {
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
      // Tab if the last key navigated within another widget, including a tab list.
      else if (['ArrowDown', 'ArrowRight'].includes(lastNavKey)) {
        return 'Tab';
      }
      // Tab if the focus is in an iframe.
      else if (focus.tagName === 'IFRAME') {
        return 'Tab';
      }
      // Tab otherwise.
      else {
        return 'Tab';
      }
    }
    // Otherwise, i.e. if the focal element is newly focused, return:
    else {
      // ArrowDown if the focus is on a radio button.
      if (focus.tagName === 'INPUT' && focus.type === 'radio') {
        return 'ArrowDown';
      }
      // ArrowDown if the focus is on a content-expanding button.
      else if (
        ['menu', 'true'].includes(focus.ariaHasPopup)
        || (focus.hasAttribute('aria-controls') && focus.ariaExpanded === 'false')
      ) {
        return 'ArrowDown';
      }
      // ArrowDown or ArrowRight if the focus is on another menu item.
      else if (role === 'menuitem') {
        // Returns the explicit role, if any, of the menu that a menu item is an item of.
        const owningMenuRole = menuItem => {
          const parent = menuItem.parentElement;
          const parentRole = parent.getAttribute('role');
          if (parentRole && ['menu', 'menubar'].includes(parentRole)) {
            return parentRole;
          }
          else {
            const grandparent = parent.parentElement;
            const grandparentRole = grandparent.getAttribute('role');
            if (grandparentRole && ['menu', 'menubar'].includes(grandparentRole)) {
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
      // ArrowDown or ArrowRight if the focus is on a tab.
      else if (role === 'tab') {
        // Returns the orientation of the tab list that a tab is in.
        const tabListOrientationOf = tab => {
          const parent = tab.parentElement;
          const parentRole = parent.getAttribute('role');
          if (parentRole === 'tablist') {
            return parent.ariaOrientation;
          }
          else {
            const grandparent = parent.parentElement;
            const grandparentRole = grandparent.getAttribute('role');
            if (grandparentRole === 'tablist') {
              return grandparent.ariaOrientation;
            }
            else {
              return '';
            }
          }
        };
        const tabListOrientation = tabListOrientationOf(focus);
        return tabListOrientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      }
      // Tab otherwise.
      else {
        return 'Tab';
      }
    }
  }, [lastNavKey, focus, status]);
  // Recursively focuses elements and performs an operation on them.
  const opAll = async () => {
    /*
      Identify and operate on the newly focused element, if any, and return the effective focus
      and a status.
    */
    const focusAndStatus = await op(page);
    const focus = focusAndStatus[0];
    const status = focusAndStatus[1];
    // FUNCTION DEFINITIONS START
    // Identifies and presses the next navigation key and processes the focused element.
    const doNext = async () => {
      // Identify the next navigation key to be pressed.
      const nextKey = await nextNavKey(lastNavKey, focus, status);
      // If it exists:
      if (nextKey) {
        // Press it.
        await page.keyboard.press(lastNavKey = nextKey);
        // Process the element focused by that keypress.
        await opAll();
      }
    };
    // Presses the Tab key and processes the focused element.
    const tabDoNext = async () => {
      // Press the Tab key.
      await page.keyboard.press(lastNavKey = 'Tab');
      // Process the element focused by that keypress.
      await opAll();
    };
    // FUNCTION DEFINITIONS END
    // If the status is external:
    if (status === 'external') {
      // Increment the count. If the external limit has not been reached:
      if (externalCount++ < externalLimit) {
        // Press the Tab key and process the focused element.
        await tabDoNext();
      }
    }
    // Otherwise, if the status is already and the last navigation key was Tab:
    else if (status === 'already' && lastNavKey === 'Tab') {
      // Increment the count.
      alreadyCount++;
      // If this is the first already:
      if (alreadyCount === 1) {
        // Identify and press the next navigation key and process the focused element.
        await doNext();
      }
      // Otherwise, if it is not the first but the already limit has not been reached:
      else if (alreadyCount < alreadyLimit) {
        // Press the Tab key and process the focused element.
        await tabDoNext();
      }
    }
    // Otherwise, i.e. if the status is new:
    else {
      // Reinitialize the already count.
      alreadyCount = 0;
      // Identify and press the next navigation key and process the focused element.
      await doNext();
    }
  };

  // ### OPERATION

  // Press the Tab key.
  await page.keyboard.press(lastNavKey);
  // Recursively focus and operate on elements.
  await opAll();
};
