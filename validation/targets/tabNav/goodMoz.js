/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/
const manageTabs = () => {
  const tablist = document.querySelectorAll('[role="tablist"]')[0];
  let tabs;
  let panels;

  const generateArrays = () => {
    tabs = document.querySelectorAll('[role="tab"]');
    panels = document.querySelectorAll('[role="tabpanel"]');
  };

  generateArrays();

  // For easy reference
  const keys = {
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  // Add or substract depending on key pressed
  const direction = {
    37: -1,
    38: -1,
    39: 1,
    40: 1
  };

  // When a tab is clicked, activateTab is fired to activate it
  const clickEventListener = event => {
    const tab = event.target;
    activateTab(tab, false);
  };

  // Handle keydown on tabs
  const keydownEventListener = event => {
    const key = event.keyCode;

    switch (key) {
    case keys.end:
      event.preventDefault();
      // Activate last tab
      activateTab(tabs[tabs.length - 1]);
      break;
    case keys.home:
      event.preventDefault();
      // Activate first tab
      activateTab(tabs[0]);
      break;

    // Up and down are in keydown
    // because we need to prevent page scroll >:)
    case keys.up:
    case keys.down:
      determineOrientation(event);
      break;
    }
  };

  // Handle keyup on tabs
  const keyupEventListener = event => {
    const key = event.keyCode;

    switch (key) {
    case keys.left:
    case keys.right:
      determineOrientation(event);
      break;
    }
  };

  const addListeners = index => {
    tabs[index].addEventListener('click', clickEventListener);
    tabs[index].addEventListener('keydown', keydownEventListener);
    tabs[index].addEventListener('keyup', keyupEventListener);

    // Build an array with all tabs (<button>s) in it
    tabs[index].index = index;
  };

  // Bind listeners
  for (let i = 0; i < tabs.length; ++i) {
    addListeners(i);
  }

  // When a tablist’s aria-orientation is set to vertical,
  // only up and down arrow should function.
  // In all other cases only left and right arrow function.
  const determineOrientation = event => {
    const key = event.keyCode;
    const vertical = tablist.getAttribute('aria-orientation') == 'vertical';
    let proceed = false;

    if (vertical) {
      if (key === keys.up || key === keys.down) {
        event.preventDefault();
        proceed = true;
      }
    }
    else {
      if (key === keys.left || key === keys.right) {
        proceed = true;
      }
    }

    if (proceed) {
      switchTabOnArrowPress(event);
    }
  };

  // Either focus the next, previous, first, or last tab
  // depening on key pressed
  function switchTabOnArrowPress (event) {
    const pressed = event.keyCode;

    for (let x = 0; x < tabs.length; x++) {
      tabs[x].addEventListener('focus', focusEventHandler);
    }

    if (direction[pressed]) {
      const target = event.target;
      if (target.index !== undefined) {
        if (tabs[target.index + direction[pressed]]) {
          tabs[target.index + direction[pressed]].focus();
        }
        else if (pressed === keys.left || pressed === keys.up) {
          focusLastTab();
        }
        else if (pressed === keys.right || pressed == keys.down) {
          focusFirstTab();
        }
      }
    }
  }

  // Activates any given tab panel
  const activateTab = (tab, setFocus) => {
    setFocus = setFocus || true;
    // Deactivate all other tabs
    deactivateTabs();

    // Remove tabindex attribute
    tab.removeAttribute('tabindex');

    // Set the tab as selected
    tab.setAttribute('aria-selected', 'true');

    // Get the value of aria-controls (which is an ID)
    var controls = tab.getAttribute('aria-controls');

    // Remove hidden attribute from tab panel to make it visible
    document.getElementById(controls).removeAttribute('hidden');

    // Set focus when required
    if (setFocus) {
      tab.focus();
    }
  };

  // Deactivate all tabs and tab panels
  const deactivateTabs = () => {
    for (let t = 0; t < tabs.length; t++) {
      tabs[t].setAttribute('tabindex', '-1');
      tabs[t].setAttribute('aria-selected', 'false');
      tabs[t].removeEventListener('focus', focusEventHandler);
    }

    for (let p = 0; p < panels.length; p++) {
      panels[p].setAttribute('hidden', 'hidden');
    }
  };

  // Make a guess
  const focusFirstTab = () => {
    tabs[0].focus();
  };

  // Make a guess
  const focusLastTab = () => {
    tabs[tabs.length - 1].focus();
  };

  //
  const focusEventHandler = event => {
    const target = event.target;

    setTimeout(checkTabFocus, 0, target);
  };

  // Only activate tab on focus if it still has focus after the delay
  const checkTabFocus = target => {
    const focused = document.activeElement;

    if (target === focused) {
      activateTab(target, false);
    }
  };
};

manageTabs();