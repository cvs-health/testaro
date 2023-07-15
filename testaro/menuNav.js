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
// Module to make all elements visible.
const {allVis} = require('../procs/allVis');

// ########## FUNCTIONS

// Returns an adjacent index, with wrapping.
const getAdjacentIndexWithWrap = (groupSize, startIndex, increment) => {
  let newIndex = startIndex + increment;
  if (newIndex < 0) {
    newIndex = groupSize - 1;
  }
  else if (newIndex > groupSize - 1) {
    newIndex = 0;
  }
  return newIndex;
};
// Returns the index of the menu item expected to be focused or pseudofocused after a keypress.
const getExpectedFocusIndex = async (isHorizontal, hasPopup, groupSize, startIndex, key) => {
  console.log(`Starting at ${startIndex}`);
  if (key === 'Home') {
    return 0;
  }
  else if (key === 'End') {
    return groupSize - 1;
  }
  else if (key === 'Tab') {
    return -1;
  }
  else if (isHorizontal) {
    if (key === 'ArrowLeft') {
      return getAdjacentIndexWithWrap(groupSize, startIndex, -1);
    }
    else if (key === 'ArrowRight') {
      return getAdjacentIndexWithWrap(groupSize, startIndex, 1);
    }
    else if (['ArrowUp', 'ArrowDown'].includes(key)) {
      return hasPopup ? -1 : startIndex;
    }
    else {
      return startIndex;
    }
  }
  else {
    if (key === 'ArrowUp') {
      console.log(`Group size is ${groupSize}`);
      return getAdjacentIndexWithWrap(groupSize, startIndex, -1);
    }
    else if (key === 'ArrowDown') {
      return getAdjacentIndexWithWrap(groupSize, startIndex, 1);
    }
    else if (['ArrowLeft', 'ArrowRight'].includes(key)) {
      return hasPopup ? -1 : startIndex;
    }
    else {
      return startIndex;
    }
  }
};
// Returns the index of the menu item that is focused or pseudofocused.
const getFocusIndex = async groupLoc => {
  const focusIndex = await groupLoc.evaluateAll(elements => {
    const focEl = document.activeElement;
    console.log(`Newly active element ${focEl.id || focEl.textContent.trim()}`);
    let focusIndex = elements.indexOf(focEl);
    const focID = focEl.getAttribute('aria-activedescendant');
    if (focID) {
      console.log(`Effective focus ID is ${focID}`);
      const elIDs = elements.map(element => element.id);
      const pseudoFocusIndex = elIDs.indexOf(focID);
      if (pseudoFocusIndex > -1) {
        focusIndex = pseudoFocusIndex;
      }
    }
    return focusIndex;
  });
  return focusIndex;
};
exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // For each menu-item navigation key:
  for (
    // const key of ['Home', 'End', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    const key of ['ArrowUp']
  ) {
    console.log(`>>> ${key}`);
    // Make all elements visible.
    await allVis(page);
    // Get locators for all menus.
    const menuLocAll = page.locator('[role=menu], [role=menubar]');
    const menuLocsAll = await menuLocAll.all();
    // For each menu:
    for (const menuLoc of menuLocsAll) {
      // Get its orientation.
      const menuRole = await menuLoc.getAttribute('role');
      let orientation = await menuLoc.getAttribute('aria-orientation');
      if (! orientation) {
        orientation = menuRole === 'menubar' ? 'horizontal' : 'vertical';
      }
      // Get locators for its direct menu items.
      const miLocAll = menuLoc.locator(
        ':scope [role=menuitem]:not([role=menu] [role=menuitem]):not([role=menubar] [role=menuitem])'
      );
      const miLocsAll = await miLocAll.all();
      // If there are at least 2 of them:
      if (miLocsAll.length > 1) {
        // For each menu item of the menu:
        for (const index in miLocsAll) {
          // Get it and its index within the menu items of the menu.
          const loc = miLocsAll[index];
          console.log((await loc.textContent()).trim());
          const indexNum = Number.parseInt(index);
          // Get data on the menu item.
          const elData = await getLocatorData(loc);
          const hasPopupVal = await loc.getAttribute('aria-haspopup');
          const hasPopup = ['menu', true].includes(hasPopupVal);
          // Get the index of the menu item expected to be focused after the key is pressed.
          const expectedFocusIndex = await getExpectedFocusIndex(
            orientation === 'horizontal', hasPopup, miLocsAll.length, indexNum, key
          );
          // Focus the menu item and press the key.
          await loc.press(key);
          // Get the index of the menu item actually focused.
          const actualFocusIndex = await getFocusIndex(miLocAll);
          console.log(`Should be ${expectedFocusIndex} and is ${actualFocusIndex}`);
          // If they differ:
          if (actualFocusIndex !== expectedFocusIndex) {
            // Add to the totals.
            totals[0]++;
            // If itemization is required:
            if (withItems) {
              // Add an instance to the result.
              standardInstances.push({
                ruleID: 'menuNav',
                what: `Menu item responds nonstandardly to the ${key} key`,
                ordinalSeverity: 0,
                tagName: elData.tagName,
                id: elData.id,
                location: elData.location,
                excerpt: elData.excerpt
              });
            }
          }
        }
      }
    }
  }
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
