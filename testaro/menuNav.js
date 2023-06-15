/*
  menuNav
  This test reports nonstandard keyboard navigation among menu items in menus that manage true
  focus. Menus that use pseudofocus with the 'aria-activedescendant' attribute are not tested.
  Standards are based on https://www.w3.org/TR/wai-aria-practices-1.1/#menu.
*/
exports.reporter = async (page, withItems) => {
  // Initialize a report.
  let data = {
    totals: {
      navigations: {
        all: {
          total: 0,
          correct: 0,
          incorrect: 0
        },
        specific: {
          tab: {
            total: 0,
            correct: 0,
            incorrect: 0
          },
          left: {
            total: 0,
            correct: 0,
            incorrect: 0
          },
          right: {
            total: 0,
            correct: 0,
            incorrect: 0
          },
          up: {
            total: 0,
            correct: 0,
            incorrect: 0
          },
          down: {
            total: 0,
            correct: 0,
            incorrect: 0
          },
          home: {
            total: 0,
            correct: 0,
            incorrect: 0
          },
          end: {
            total: 0,
            correct: 0,
            incorrect: 0
          }
        }
      },
      menuItems: {
        total: 0,
        correct: 0,
        incorrect: 0
      },
      menus: {
        total: 0,
        correct: 0,
        incorrect: 0
      }
    }
  };
  if (withItems) {
    data.menuItems = {
      incorrect: [],
      correct: []
    };
  }
  // Identify an array of the true-focus menus.
  const menus = await page.$$(
    '[role=menu]:not([aria-activedescendant]), [role=menubar]:not([aria-activedescendant])'
  );
  if (menus.length) {
    // FUNCTION DEFINITIONS START
    // Returns text associated with an element.
    const {allText} = require('../procs/allText');
    // Returns the index of the focused menu item in an array of menu items.
    const focusedMenuItem = async menuItems => await page.evaluate(menuItems => {
      const focus = document.activeElement;
      return menuItems.indexOf(focus);
    }, menuItems);
    // Tests a navigation on a menu item.
    const testKey = async (
      menu, menuItems, menuItem, keyName, keyProp, goodIndex, itemIsCorrect, itemData
    ) => {
      // Make the menu visible and the menu item the active one.
      await page.evaluate(args => {
        const menu = args[0];
        const menuItems = args[1];
        const menuItem = args[2];
        menu.style.display = 'revert';
        menu.style.visibility = 'visible';
        menu.style.opacity = 1;
        menuItems.forEach(item => {
          item.tabIndex = -1;
        });
        menuItem.tabIndex = 0;
      }, [menu, menuItems, menuItem]);
      // Focus it and press the specified key.
      await menuItem.press(keyName);
      // Increment the counts of navigations and key navigations.
      data.totals.navigations.all.total++;
      data.totals.navigations.specific[keyProp].total++;
      // Identify which menu item is now focused, if any.
      const focusIndex = await focusedMenuItem(menuItems);
      // If the focus is correct:
      if (
        goodIndex === null
          ? [-1, menuItems.indexOf(menuItem)].includes(focusIndex)
          : focusIndex === goodIndex
      ) {
        // Increment the counts of correct navigations and correct key navigations.
        data.totals.navigations.all.correct++;
        data.totals.navigations.specific[keyProp].correct++;
      }
      // Otherwise, i.e. if the focus is incorrect:
      else {
        // Increment the counts of incorrect navigations and incorrect key navigations.
        data.totals.navigations.all.incorrect++;
        data.totals.navigations.specific[keyProp].incorrect++;
        // Update the menu-item status to incorrect.
        itemIsCorrect = false;
        // If itemization is required:
        if (withItems) {
          // Update the menu-item report.
          itemData.navigationErrors.push(keyName);
        }
      }
      return itemIsCorrect;
    };
    // Returns the index to which an arrow key should move the focus.
    const arrowTarget = (startIndex, itemCount, orientation, direction) => {
      if (orientation === 'horizontal') {
        if (direction === 'left') {
          return startIndex ? startIndex - 1 : itemCount - 1;
        }
        else if (direction === 'right') {
          return startIndex === itemCount - 1 ? 0 : startIndex + 1;
        }
      }
      else if (orientation === 'vertical') {
        if (direction === 'up') {
          return startIndex ? startIndex - 1 : itemCount - 1;
        }
        else if (direction === 'down') {
          return startIndex === itemCount - 1 ? 0 : startIndex + 1;
        }
      }
    };
    // Recursively tests menu items of a menu.
    const testMenuItems = async (menu, menuItems, index, orientation, menuIsCorrect) => {
      const itemCount = menuItems.length;
      // If any menu items remain to be tested:
      if (index < itemCount) {
        // Increment the reported count of menu items.
        data.totals.menuItems.total++;
        // Identify the menu item to be tested.
        const currentItem = menuItems[index];
        // Initialize it as correct.
        let isCorrect = true;
        const itemData = {};
        // If itemization is required:
        if (withItems) {
          // Initialize a report on the menu item.
          const identifiers = await page.evaluate(element => ({
            tagName: element.tagName,
            id: element.id
          }), currentItem);
          itemData.tagName = identifiers.tagName;
          itemData.id = identifiers.id;
          itemData.text = await allText(page, currentItem);
          itemData.navigationErrors = [];
        }
        // Test the element with each navigation key.
        isCorrect = await testKey(
          menu, menuItems, currentItem, 'Tab', 'tab', -1, isCorrect, itemData
        );
        // FUNCTION DEFINITION START
        // Tests arrow-key navigation.
        const testArrow = async (keyName, keyProp) => {
          isCorrect = await testKey(
            menu,
            menuItems,
            currentItem,
            keyName,
            keyProp,
            arrowTarget(index, itemCount, orientation, keyProp),
            isCorrect,
            itemData
          );
        };
        // FUNCTION DEFINITION END
        if (orientation === 'vertical') {
          await testArrow('ArrowUp', 'up');
          await testArrow('ArrowDown', 'down');
        }
        else {
          await testArrow('ArrowRight', 'right');
          await testArrow('ArrowLeft', 'left');
        }
        isCorrect = await testKey(
          menu, menuItems, currentItem, 'Home', 'home', 0, isCorrect, itemData
        );
        isCorrect = await testKey(
          menu, menuItems, currentItem, 'End', 'end', itemCount - 1, isCorrect, itemData
        );
        // Update the menu status (Node 14 does not support the ES 2021 &&= operator).
        menuIsCorrect = menuIsCorrect && isCorrect;
        // Increment the data.
        data.totals.menuItems[isCorrect ? 'correct' : 'incorrect']++;
        if (withItems) {
          data.menuItems[isCorrect ? 'correct' : 'incorrect'].push(itemData);
        }
        // Process the next menu item.
        return await testMenuItems(menu, menuItems, index + 1, orientation, menuIsCorrect);
      }
      // Otherwise, i.e. if all menu items have been tested:
      else {
        // Return whether the menu is correct.
        return menuIsCorrect;
      }
    };
    // Recursively tests menus.
    const testMenus = async menus => {
      // If any menus remain to be tested:
      if (menus.length) {
        // Identify the first of them.
        const firstMenu = menus[0];
        // Identify its orientation.
        const menuRole = await firstMenu.getAttribute('role');
        const orientationAttribute = await firstMenu.getAttribute('aria-orientation');
        const orientation = orientationAttribute || (
          menuRole === 'menu' ? 'vertical' : 'horizontal'
        );
        // Identify its direct menu items.
        const menuItems = await firstMenu.$$(
          '[role=menuitem]:not([role=menu] [role=menuitem]):not([role=menubar] [role=menuitem])'
        );
        // If the menu contains at least 2 direct menu items:
        if (menuItems.length > 1) {
          // Test its menu items.
          let isCorrect = false;
          try {
            isCorrect = await testMenuItems(firstMenu, menuItems, 0, orientation, true);
            // Increment the data.
            data.totals.menus.total++;
            data.totals.menus[isCorrect ? 'correct' : 'incorrect']++;
            // Process the remaining menus.
            await testMenus(menus.slice(1));
          }
          catch(error) {
            console.log(`ERROR: menuNav could not perform tests (${error.message})`);
            data = {
              prevented: true,
              error: error.message
            };
          }
        }
      }
    };
    // FUNCTION DEFINITIONS END
    await testMenus(menus);
  }
  const totals = data.totals ? [
    data.totals.navigations.all.incorrect,
    data.totals.menuItems.incorrect,
    data.totals.menus.incorrect,
    0
  ] : [];
  const standardInstances = [];
  if (data.menuItems && data.menuItems.incorrect) {
    data.menuItems.incorrect.forEach(item => {
      standardInstances.push({
        ruleID: 'menuNav',
        what: `Menu item responds nonstandardly to ${item.navigationErrors.join(', ')}`,
        count: item.navigationErrors.length,
        ordinalSeverity: 1,
        tagName: item.tagName,
        id: item.id,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: item.text
      });
    });
  }
  else if (data.totals.menuItems.incorrect) {
    standardInstances.push({
      ruleID: 'menuNav',
      what: 'Menus and menu items have nonstandard navigation',
      count: data.totals.navigations.all.incorrect,
      ordinalSeverity: 1,
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
