/*
  buttonMenu
  This test reports nonstandard navigation among menu items of button-controlled menus.
  Standards are based on https://www.w3.org/TR/wai-aria-practices-1.1/#menu.
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
// Returns whether a key created the expected effective focus.
const focusSuccess = async (miLocAll, priorIndex, key, isPseudo) => {
  // Get the index of the effectively focused menu item.
  const focData = await miLocAll.evaluateAll(elements => {
    let focEl = document.activeElement;
    let miFocIndex;
    if (isPseudo) {
      const pseudoFocID = focEl.getAttribute('aria-activedescendant');
      if (pseudoFocID) {
        miFocIndex = elements.map(element => element.id).indexOf(pseudoFocID);
      }
    }
    else {
      miFocIndex = elements.indexOf(focEl);
    }
    if (miFocIndex > -1) {
      return {
        count: elements.length,
        miFocIndex
      };
    }
    else {
      return null;
    }
  });
  let result = {
    isOK: false,
    newFocIndex: null
  };
  if (focData) {
    if (key === 'Home' && focData.miFocIndex === 0) {
      result.isOK = true;
      result.newFocIndex = 0;
    }
    else if (key === 'End' && focData.miFocIndex === focData.count - 1) {
      result.isOK = true;
      result.newFocIndex = focData.count - 1;
    }
    else if (['ArrowLeft', 'ArrowUp'].includes(key)) {
      const expectedIndex = getAdjacentIndexWithWrap(focData.count, priorIndex, -1);
      if (focData.miFocIndex === expectedIndex) {
        result.isOK = true;
        result.newFocIndex = expectedIndex;
      }
    }
    else if (['ArrowRight', 'ArrowDown'].includes(key)) {
      const expectedIndex = getAdjacentIndexWithWrap(focData.count, priorIndex, 1);
      if (focData.miFocIndex === expectedIndex) {
        result.isOK = true;
        result.newFocIndex = expectedIndex;
      }
    }
  }
};
// Performs the test and reports the result.
exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all menu buttons with collapsed menus.
  const mbLocAll = page.locator(
    'button[aria-controls][aria-expanded=false][aria-haspopup=true], button[aria-controls][aria-expanded=false][aria-haspopup=menu]'
  );
  const mbLocsAll = await mbLocAll.all();
  // For each menu button:
  for (const mbLoc of mbLocsAll) {
    // Get a locator for its menu.
    const menuID = await mbLoc.getAttribute('aria-controls');
    const menuLoc = mbLoc.locator(`[id=${menuID}][role=menu], [id=${menuID}][role=menubar]`);
    // If the button controls a menu:
    if (menuLoc) {
      // Get data on the menu.
      const elData = await getLocatorData(menuLoc);
      // Get the orientation of the menu.
      let orientation;
      try {
        orientation = await menuLoc.getAttribute('aria-orientation', {timeout: 100});
      }
      catch(error) {
        console.log(`About to get role of:\n${JSON.stringify(elData, null, 2)}`);
        const menuRole = await menuLoc.getAttribute('role');
        orientation = menuRole === 'menubar' ? 'horizontal' : 'vertical';
      }
      // Get the focus-management type of the menu.
      let isPseudo;
      menuLoc.getAttribute('aria-activedescendant', {timeout: 100})
      .then(() => {
        isPseudo = true;
      })
      .catch(() => {
        isPseudo = false;
      });
      console.log('Got isPseudo');
      // Get locators for its direct menu items.
      const miLocAll = menuLoc.locator(
        ':scope [role=menuitem]:not([role=menu] [role=menuitem]):not([role=menubar] [role=menuitem])'
      );
      console.log('Got miLocAll');
      const miLocsAll = await miLocAll.all();
      // If there are at least 2 of them:
      if (miLocsAll.length > 1) {
        // Focus the menu button and press the key that opens its menu from the top.
        await mbLoc.press(orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown');
        // Randomly draw 12 keys from Home, End, and the applicable arrow keys.
        const keys = ['Home', 'End'];
        if (orientation === 'horizontal') {
          keys.push('ArrowLeft', 'ArrowRight');
        }
        else {
          keys.push('ArrowUp', 'ArrowDown');
        }
        const trialKeys = [];
        let trialKeyCount = 0;
        while (trialKeyCount++ < 12) {
          trialKeys.push(keys[Math.floor(4 * Math.random())]);
        }
        let focIndex = 0;
        // For each key:
        for (const key of trialKeys) {
          // Press it.
          await page.keyboard.press(key);
          // Get whether the expected focus occurred.
          const focData = await focusSuccess(miLocAll, focIndex, key, isPseudo);
          // If so:
          if (focData.isOK) {
            // Update the index of the effective focus.
            focIndex = focData.newFocIndex;
          }
          // Otherwise, i.e. if the expected focus did not occur:
          else {
            // Add to the totals.
            totals[2]++;
            // If itemization is required:
            if (withItems) {
              // Add an instance to the result.
              standardInstances.push({
                ruleID: 'buttonMenu',
                what: `Menu responds nonstandardly to the ${key} key`,
                ordinalSeverity: 2,
                tagName: elData.tagName,
                id: elData.id,
                location: elData.location,
                excerpt: elData.excerpt
              });
            }
            break;
          }
        }
      }
    }
  }
  // If itemization is not required and there are any instances:
  if (! withItems && totals[2]) {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'menuNav',
      what: 'Menu items respond nonstandardly to navigation keys',
      count: totals[2],
      ordinalSeverity: 2,
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
