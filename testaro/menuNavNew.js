/*
  menuNav
  This test reports nonstandard keyboard navigation among menu items.
  Standards are based on https://www.w3.org/TR/wai-aria-practices-1.1/#menu.
  This test is limited to navigations that expose a set of menu items and navigate from one menu
  item to another.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

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
const getExpectedFocusIndex = async (isHorizontal, groupSize, startIndex, key) => {
  if (key === 'Home') {
    return 0;
  }
  else if (key === 'End') {
    return groupSize - 1;
  }
  else if (isHorizontal) {
    if (key === 'ArrowLeft') {
      return getAdjacentIndexWithWrap(groupSize, startIndex, -1);
    }
    else if (key === 'ArrowRight') {
      return getAdjacentIndexWithWrap(groupSize, startIndex, 1);
    }
  }
  else {
    if (key === 'ArrowUp') {
      return getAdjacentIndexWithWrap(groupSize, startIndex, -1);
    }
    else if (key === 'ArrowDown') {
      return getAdjacentIndexWithWrap(groupSize, startIndex, 1);
    }
  }
};
// Presses a key.
const pressKey = async (page, key) => {
  await page.keyboard.press(key);
};
// Returns the index of the menu item that is focused or pseudofocused.
const getFocusIndex = async groupLoc => {
  const focusIndex = await groupLoc.evaluateAll(elements => {
    const focEl = document.activeElement;
    let focusIndex = elements.indexOf(focEl);
    const focID = focEl.getAttribute('aria-activedescendant');
    if (focID) {
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
    console.log(`Next menu orientation: ${orientation}`);
    // Get its focus management type.
    const isPseudo = await menuLoc.getAttribute('aria-activedescendant');
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
          const indexNum = Number.parseInt(index);
          // Get data on the menu item.
          const elData = await getLocatorData(loc);
          const hasPopupVal = await loc.getAttribute('aria-haspopup');
          const hasPopup = ['menu', true].includes(hasPopupVal);
          // Get the index of the menu item to be effectively focused after the key is pressed.
          const expectedFocusIndex = await getExpectedFocusIndex(
            orientation === 'horizontal', hasPopup, miLocsAll.length, indexNum, key
          );
          // Effectively focus the menu item and press the key.
          await pressKeyOn(menuLoc, miLocsAll[index], isPseudo, key);
          // Get the index of the menu item actually effectively focused.
          const actualFocusIndex = await getFocusIndex(miLocAll);
          // If they differ:
          if (actualFocusIndex !== expectedFocusIndex) {
            console.log(`Expected ${expectedFocusIndex} but got ${actualFocusIndex} from ${key} on ${elData.excerpt}`);
            console.log(await page.evaluate(() => {
              return document.activeElement.tagName + ': ' + document.activeElement.textContent.slice(0, 100);
            }));
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

  // For each menu-item navigation key:
  for (
    // const key of ['Home', 'End', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    const key of ['ArrowUp']
  ) {

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
