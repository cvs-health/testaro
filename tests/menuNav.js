// Tests true-focus menu navigation.
exports.reporter = async (page, withItems) => {
  // Initialize a report.
  const data = {
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
    const {allText} = require('../procs/test/allText');
    // Returns the index of the focused menu item in an array of menu items.
    const focusedMenuItem = async menuItems => await page.evaluate(menuItems => {
      const focus = document.activeElement;
      return menuItems.indexOf(focus);
    }, menuItems);
    // Tests a navigation on a menu item.
    const testKey = async (
      menuItems, menuItem, keyName, keyProp, goodIndex, itemIsCorrect, itemData
    ) => {
      // Click the menu item, to make the focus on it effective.
      await menuItem.click();
      // Refocus the menu item and press the specified key (page.keyboard.press may fail).
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
    const arrowTarget = (startIndex, itemCount, orientation, hasSubmenu, direction) => {
      if (orientation === 'horizontal') {
        // Up or down will exit the menu if there is a sibling menu or else not move the focus.
        if (['up', 'down'].includes(direction)) {
          return hasSubmenu ? -1 : null;
        }
        else if (direction === 'left') {
          return startIndex ? startIndex - 1 : itemCount - 1;
        }
        else if (direction === 'right') {
          return startIndex === itemCount - 1 ? 0 : startIndex + 1;
        }
      }
      else if (orientation === 'vertical') {
        // Left or right will exit the menu if there is a sibling menu or else not move the focus.
        if (['left', 'right'].includes(direction)) {
          return hasSubmenu ? -1 : null;
        }
        else if (direction === 'up') {
          return startIndex ? startIndex - 1 : itemCount - 1;
        }
        else if (direction === 'down') {
          return startIndex === itemCount - 1 ? 0 : startIndex + 1;
        }
      }
    };
    /*
      Recursively tests menu items of a menu (per
      https://www.w3.org/TR/wai-aria-practices-1.1/#menu)
    */
    const testMenuItems = async (menuItems, index, orientation, menuIsCorrect) => {
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
          itemData.tagName = await page.evaluate(element => element.tagName, currentItem);
          itemData.text = await allText(page, currentItem);
          itemData.navigationErrors = [];
        }
        // Identify whether the menu item has a submenu.
        const hasSubmenu = ['true', 'menu'].includes(
          await currentItem.getAttribute('aria-haspopup')
        );
        // Test the element with each navigation key.
        isCorrect = await testKey(menuItems, currentItem, 'Tab', 'tab', -1, isCorrect, itemData);
        isCorrect = await testKey(
          menuItems,
          currentItem,
          'ArrowLeft',
          'left',
          arrowTarget(index, itemCount, orientation, hasSubmenu, 'left'),
          isCorrect,
          itemData
        );
        isCorrect = await testKey(
          menuItems,
          currentItem,
          'ArrowRight',
          'right',
          arrowTarget(index, itemCount, orientation, hasSubmenu, 'right'),
          isCorrect,
          itemData
        );
        isCorrect = await testKey(
          menuItems,
          currentItem,
          'ArrowUp',
          'up',
          arrowTarget(index, itemCount, orientation, hasSubmenu, 'up'),
          isCorrect,
          itemData
        );
        isCorrect = await testKey(
          menuItems,
          currentItem,
          'ArrowDown',
          'down',
          arrowTarget(index, itemCount, orientation, hasSubmenu, 'down'),
          isCorrect,
          itemData
        );
        isCorrect = await testKey(menuItems, currentItem, 'Home', 'home', 0, isCorrect, itemData);
        isCorrect = await testKey(
          menuItems, currentItem, 'End', 'end', itemCount - 1, isCorrect, itemData
        );
        // Update the tablist status (&&= operator from ES 2021 rejected by node 14).
        menuIsCorrect = menuIsCorrect && isCorrect;
        // Increment the data.
        data.totals.tabElements[isCorrect ? 'correct' : 'incorrect']++;
        if (withItems) {
          data.tabElements[isCorrect ? 'correct' : 'incorrect'].push(itemData);
        }
        // Process the next tab element.
        return await testMenuItems(menuItems, index + 1, orientation, menuIsCorrect);
      }
      // Otherwise, i.e. if all tab elements have been tested:
      else {
        // Return whether the tablist is correct.
        return menuIsCorrect;
      }
    };
    // Recursively tests tablists.
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
          '[role=menuitem]:not([role=menuitem] [role=menuitem])'
        );
        // If the menu contains at least 2 direct menu items:
        if (menuItems.length > 1) {
          // Ensure that the menu is visible.
          await page.evaluate(menu => {
            menu.setAttribute('aria-expanded', true);
            menu.style.display = 'revert';
            menu.style.visibility = 'visible';
            menu.style.opacity = 1;
          }, firstMenu);
          // Test its menu items.
          const isCorrect = await testMenuItems(menuItems, 0, orientation, true);
          // Increment the data.
          data.totals.menus.total++;
          data.totals.menus[isCorrect ? 'correct' : 'incorrect']++;
          // Process the remaining menus.
          await testMenus(menus.slice(1));
        }
      }
    };
    // FUNCTION DEFINITIONS END
    await testMenus(menus);
  }
  return {result: data};
};
