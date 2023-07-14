/*
  menuNav
  This test reports nonstandard keyboard navigation among menu items.
  Standards are based on https://www.w3.org/TR/wai-aria-practices-1.1/#menu.
  A prior version of this test covered all menus and, before operating on their menu items, set
  their display style property to revert, their visibility style properties to visible, their
  opacity style property to 1, the tabIndex style properties of the menu item to be operated on
  to 0, and the tabIndex style properties of the other menu items to -1.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all menu items.
  const locAll = page.locator('[role=menuitem]');
  const locsAll = await locAll.all();
  // Get data on the menu items.
  const elDataAll = [];
  for (const loc of locsAll) {
    const elData = await getLocatorData(loc);
    elDataAll.push(elData);
  }
  // Get the keys nonstandardly responded to by all menu items.
  const badKeyArrays = await locAll.evaluateAll(menuItems => {
    // FUNCTION DEFINITIONS START
    // Returns an adjacent index, with wrapping.
    const wrap = (groupSize, startIndex, increment) => {
      let newIndex = startIndex + increment;
      if (newIndex < 0) {
        newIndex = groupSize - 1;
      }
      else if (newIndex > groupSize - 1) {
        newIndex = 0;
      }
      return newIndex;
    };
    // Returns whether a menu item standardly responds to a key.
    const test = (key, allData, index, peerIndexes) => {
      console.log(key);
      // Get data on the menu item.
      const peerIndex = peerIndexes.indexOf(index);
      const peerCount = peerIndexes.length;
      const {menuItem, menu} = allData[index];
      const hasPopupVal = menuItem.getAttribute('aria-haspopup');
      const hasPopup = ['menu', true].includes(hasPopupVal);
      const menuRole = menu.getAttribute('role');
      let orientation = menu.getAttribute('aria-orientation');
      if (! orientation) {
        orientation = menuRole === 'menubar' ? 'horizontal' : 'vertical';
      }
      // Focus the menu item and press the key.
      menuItem.focus();
      const keydown = new KeyboardEvent('keydown', {key});
      menuItem.dispatchEvent(keydown);
      const keyup = new KeyboardEvent('keyup', {key});
      menuItem.dispatchEvent(keyup);
      // Identify the expected peer index of the resulting focus.
      let okPeerIndex;
      if (key === 'Home') {
        okPeerIndex = 0;
      }
      else if (key === 'End') {
        okPeerIndex = peerCount - 1;
      }
      else if (key === 'Tab') {
        okPeerIndex = -1;
      }
      else if (orientation === 'horizontal') {
        if (key === 'ArrowLeft') {
          okPeerIndex = wrap(peerCount, peerIndex, -1);
        }
        else if (key === 'ArrowRight') {
          okPeerIndex = wrap(peerCount, peerIndex, 1);
        }
        else if (['ArrowUp', 'ArrowDown'].includes(key)) {
          okPeerIndex = hasPopup ? -1 : peerIndex;
        }
        else {
          okPeerIndex = peerIndex;
        }
      }
      else {
        if (key === 'ArrowUp') {
          okPeerIndex = wrap(peerCount, peerIndex, -1);
        }
        else if (key === 'ArrowDown') {
          okPeerIndex = wrap(peerCount, peerIndex, 1);
        }
        else if (['ArrowLeft', 'ArrowRight'].includes(key)) {
          okPeerIndex = hasPopup ? -1 : peerIndex;
        }
        else {
          okPeerIndex = peerIndex;
        }
      }
      console.log(`Should be ${okPeerIndex}`);
      // Identify the actual peer index of the focus or pseudofocus.
      let focEl = document.activeElement;
      console.log(focEl.textContent);
      let newPeerIndex;
      if (focEl) {
        const effectiveFocusID = focEl.getAttribute('aria-activedescendant');
        if (effectiveFocusID) {
          const effectiveFocEl = document.getElementById(effectiveFocusID);
          if (effectiveFocEl) {
            focEl = effectiveFocEl;
          }
        }
        const miIndex = menuItems.indexOf(focEl);
        console.log(`MI index is ${miIndex}`);
        newPeerIndex = miIndex > -1 ? peerIndexes.indexOf(miIndex) : -1;
      }
      else {
        newPeerIndex = -1;
      }
      console.log(`Is actually ${newPeerIndex}`);
      return newPeerIndex === okPeerIndex;
    };
    // FUNCTION DEFINITIONS END
    // Initialize the result.
    const allData = [];
    // For each menu item:
    menuItems.forEach(menuItem => {
      // Add initialized data on it to the result.
      const menu = menuItem.closest('[role=menu], [role=menubar]');
      allData.push({
        menuItem,
        menu,
        badKeys: []
      });
    });
    // For each menu item:
    for (const index in menuItems) {
      // Get its peers.
      const {menu} = allData[index];
      const peerIndexes = [];
      allData.forEach((menuItemData, index) => {
        if (menuItemData.menu === menu) {
          peerIndexes.push(index);
        }
      });
      // If it has at least 1 peer:
      if (peerIndexes.length > 1) {
        // For each navigation key:
        for (
          const key of ['Home', 'End', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
        ) {
          // Get whether the menu item misbehaves.
          const isOK = test(key, allData, index, peerIndexes);
          // If not:
          if (! isOK) {
            // Add the key to the data on the menu item.
            allData[index].badKeys.push(key);
          }
        }
      }
    }
    return allData.map(data => data.badKeys);
  });
  // For each menu item:
  badKeyArrays.forEach((miBadKeys, index) => {
    // For each of its misbehaviors:
    miBadKeys.forEach(miBadKey => {
      // Add to the totals.
      totals[0]++;
      // If itemization is required:
      if (withItems) {
        // Add an instance to the result.
        const elData = elDataAll[index];
        standardInstances.push({
          ruleID: 'menuNav',
          what: `Menu item responds nonstandardly to the ${miBadKey} key`,
          ordinalSeverity: 0,
          tagName: elData.tagName,
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    });
  });
  // If itemization is not required and there are any instances:
  if (! withItems && totals[0]) {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'menuNav',
      what: 'Menu items respond nonstandardly to navigation keys',
      count: totals[0],
      ordinalSeverity: 0,
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
