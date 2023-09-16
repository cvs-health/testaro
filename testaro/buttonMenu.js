/*
  buttonMenu
  This test reports nonstandard navigation among menu items of button-controlled menus.
  Standards are based on https://www.w3.org/TR/wai-aria-practices-1.1/#menu. The trialKeys argument
  is an array of strings, each of which may be 'Home', 'End', '+', or '-'. The '+' string represents
  the ArrowDown or ArrowRight key, and the '-' string represents the ArrowUp or ArrowLeft key,
  depending on the orientation of the current menu. When the trialKeys argument is missing or is an
  empty array, 12 keys are selected at random.
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
  // Initialize the result.
  const result = {
    isOK: false,
    newFocIndex: null
  };
  // Get the index of the effectively focused menu item.
  const focData = await miLocAll.evaluateAll((elements, isPseudo) => {
    // Get the currently focused element.
    let focEl = document.activeElement;
    // If the menu manages pseudofocus:
    let miFocIndex;
    if (isPseudo) {
      // Get the index of the effectively focused menu item.
      const pseudoFocID = focEl.getAttribute('aria-activedescendant');
      if (pseudoFocID) {
        miFocIndex = elements.map(element => element.id).indexOf(pseudoFocID);
      }
    }
    // Otherwise, i.e. if the menu manages true focus:
    else {
      // Get the index of the focused menu item.
      miFocIndex = elements.indexOf(focEl);
    }
    // If an effectively focused menu item was identified:
    if (miFocIndex > -1) {
      // Return data on the menu items.
      return {
        count: elements.length,
        miFocIndex
      };
    }
    // Otherwise, i.e. if no effectively focused menu item was identified:
    else {
      // Return this.
      return null;
    }
  }, isPseudo);
  // If data on the menu items were obtained:
  if (focData) {
    // Get whether the effective focus is as expected and update the result.
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
  // Return the result.
  return result;
};
// Performs the test and reports the result.
exports.reporter = async (page, withItems, trialKeySpecs = []) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all menu buttons.
  const mbLocAll = page.locator(
    'button[aria-controls][aria-expanded][aria-haspopup=true], button[aria-controls][aria-expanded][aria-haspopup=menu]'
  );
  // For each menu button:
  const mbLocsAll = await mbLocAll.all();
  for (const mbLoc of mbLocsAll) {
    // Get a locator for its menu.
    const menuID = await mbLoc.getAttribute('aria-controls');
    const menuLoc = page.locator(`[id=${menuID}][role=menu], [id=${menuID}][role=menubar]`);
    // If the button controls a menu:
    if (menuLoc) {
      // Get data on the menu.
      const elData = await getLocatorData(menuLoc);
      // If data were obtained:
      if (elData) {
        // Get the orientation and focus-management type of the menu.
        const extraData = await menuLoc.evaluate(element => {
          const extraData = {};
          let orientation = element.getAttribute('aria-orientation');
          if (! orientation) {
            const role = element.getAttribute('role');
            if (role === 'menubar') {
              orientation = 'horizontal';
            }
            else if (role === 'menu') {
              orientation = 'vertical';
            }
            else {
              orientation = null;
            }
          }
          extraData.orientation = orientation;
          const isPseudo = !! element.getAttribute('aria-activedescendant');
          extraData.isPseudo = isPseudo;
          return extraData;
        });
        // If they were obtained:
        if (extraData) {
          console.log('Got data');
          // Get locators for its direct menu items.
          const miLocAll = menuLoc.locator(
            ':scope [role=menuitem]:not([role=menu] [role=menuitem]):not([role=menubar] [role=menuitem])'
          );
          const miLocsAll = await miLocAll.all();
          // If there are at least 2 of them:
          if (miLocsAll.length > 1) {
            // Ensure that the menu is collapsed.
            await menuLoc.evaluate(element => {
              element.setAttribute('aria-expanded', false);
            });
            // Focus the menu button and press the key that opens its menu from the top.
            await mbLoc.press(extraData.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown');
            // If trial keys have been specified:
            const trialKeys = [];
            if (trialKeySpecs.length) {
              // Implement them.
              trialKeySpecs.forEach(spec => {
                if (['Home', 'End'].includes(spec)) {
                  trialKeys.push(spec);
                }
                else if (spec === '-') {
                  trialKeys.push(extraData.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp');
                }
                else if (spec === '+') {
                  trialKeys.push(
                    extraData.orientation === 'horizontal' ? 'ArrowtRight' : 'ArrowDown'
                  );
                }
              });
            }
            // Otherwise, i.e. if trial keys have not been specified:
            else {
              // Randomly draw 12 keys from Home, End, and the applicable arrow keys.
              const keys = ['Home', 'End'];
              if (extraData.orientation === 'horizontal') {
                keys.push('ArrowLeft', 'ArrowRight');
              }
              else {
                keys.push('ArrowUp', 'ArrowDown');
              }
              let trialKeyCount = 0;
              while (trialKeyCount++ < 12) {
                trialKeys.push(keys[Math.floor(4 * Math.random())]);
              }
            }
            // Add the list of trial keys to the result.
            data.trialKeys = trialKeys;
            let focIndex = 0;
            // For each key in the trial:
            for (const key of trialKeys) {
              // Press it.
              await page.keyboard.press(key);
              // Get whether the expected focus occurred.
              const focData = await focusSuccess(miLocAll, focIndex, key, extraData.isPseudo);
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
        // Otherwise, i.e. if the orientation and focus-management type were not obtained:
        else {
          // Report this.
          console.log('ERROR: Menu orientation and focus-management type not obtained');
        }
      }
      // Otherwise, i.e. if the data were not obtained:
      else {
        // Report this.
        console.log('ERROR: Menu data not obtained');
      }
    }
    // Otherwise, i.e. if the menu was not identified:
    else {
      // Report this.
      console.log('ERROR: Menu controlled by menu button not found');
    }
  }
  // If itemization is not required and there are any instances:
  if (! withItems && totals[2]) {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'buttonMenu',
      what: 'Menus respond nonstandardly to navigation keys',
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
