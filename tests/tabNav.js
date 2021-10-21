// Tests tablist navigation.
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
      tabElements: {
        total: 0,
        correct: 0,
        incorrect: 0
      },
      tabLists: {
        total: 0,
        correct: 0,
        incorrect: 0
      }
    }
  };
  if (withItems) {
    data.tabElements = {
      incorrect: [],
      correct: []
    };
  }
  // Identify an array of the tablists.
  const tabLists = await page.$$('[role=tablist]');
  if (tabLists.length) {
    // FUNCTION DEFINITIONS START
    // Returns text associated with an element.
    const {allText} = require('../procs/test/allText');
    // Returns the index of the focused tab in an array of tabs.
    const focusedTab = async tabs => await page.evaluate(tabs => {
      const focus = document.activeElement;
      return tabs.indexOf(focus);
    }, tabs);
    // Tests a navigation on a tab element.
    const testKey = async (
      tabs, tabElement, keyName, keyProp, goodIndex, listIsCorrect, elementIsCorrect, itemData
    ) => {
      // Focus the tab element and then press the specified key.
      await tabElement.press(keyName);
      // Increment the counts of navigations and key navigations.
      data.totals.navigations.all.total++;
      data.totals.navigations.specific[keyProp].total++;
      // Identify which tab element is now focused, if any.
      const focusIndex = await focusedTab(tabs);
      // If the focus is correct:
      if (focusIndex === goodIndex) {
        // Increment the counts of correct navigations and correct key navigations.
        data.totals.navigations.all.correct++;
        data.totals.navigations.specific[keyProp].correct++;
      }
      // Otherwise, i.e. if the focus is incorrect:
      else {
        // Increment the counts of incorrect navigations and incorrect key navigations.
        data.totals.navigations.all.incorrect++;
        data.totals.navigations.specific[keyProp].incorrect++;
        // Update the element and list statuses to incorrect.
        listIsCorrect = false;
        elementIsCorrect = false;
        // Update the element report.
        itemData.navigationErrors.push(keyName);
      }
    };
    // Return the index to which an arrow key should move the focus.
    const arrowTarget = (startIndex, tabCount, orientation, direction) => {
      if (orientation === 'horizontal') {
        if (['up', 'down'].includes(direction)) {
          return startIndex;
        }
        else if (direction === 'left') {
          return startIndex ? startIndex - 1 : tabCount - 1;
        }
        else if (direction === 'right') {
          return startIndex === tabCount - 1 ? 0 : startIndex + 1;
        }
      }
      else if (orientation === 'vertical') {
        if (['left', 'right'].includes(direction)) {
          return startIndex;
        }
        else if (direction === 'up') {
          return startIndex ? startIndex - 1 : tabCount - 1;
        }
        else if (direction === 'down') {
          return startIndex === tabCount - 1 ? 0 : startIndex + 1;
        }
      }
    };
    // Recursively tests all tab elements in a tab list.
    const testTabs = async (tabs, index, listOrientation, listIsCorrect) => {
      const tabCount = tabs.length;
      // If any tab elements remain to be tested:
      if (index < tabCount) {
        // Increment the count of tab elements.
        data.totals.tabElements.total++;
        // Identify the tab element to be tested.
        const currentTab = tabs[index];
        // Initialize it as correct.
        let isCorrect = true;
        const itemData = {};
        // If itemization is required:
        if (withItems) {
          // Initialize a report on the element.
          itemData.tagName = await page.evaluate(element => element.tagName, currentTab);
          itemData.text = await allText(page, currentTab);
          itemData.navigationErrors = [];
        }
        // Test the element with each navigation key.
        await testKey(tabs, currentTab, 'Tab', 'tab', -1, listIsCorrect, isCorrect, itemData);
        await testKey(
          tabs,
          currentTab,
          'ArrowLeft',
          'left',
          arrowTarget(index, tabCount, listOrientation, 'left'),
          listIsCorrect,
          isCorrect,
          itemData
        );
        await testKey(
          tabs,
          currentTab,
          'ArrowRightt',
          'right',
          arrowTarget(index, tabCount, listOrientation, 'right'),
          listIsCorrect,
          isCorrect,
          itemData
        );
        await testKey(
          tabs,
          currentTab,
          'ArrowUp',
          'up',
          arrowTarget(index, tabCount, listOrientation, 'up'),
          listIsCorrect,
          isCorrect,
          itemData
        );
        await testKey(
          tabs,
          currentTab,
          'ArrowDown',
          'down',
          arrowTarget(index, tabCount, listOrientation, 'down'),
          listIsCorrect,
          isCorrect,
          itemData
        );
        await testKey(tabs, currentTab, 'Home', 'home', 0, listIsCorrect, isCorrect, itemData);
        await testKey(
          tabs, currentTab, 'End', 'end', tabCount - 1, listIsCorrect, isCorrect, itemData
        );
        // Increment the data.
        data.totals.tabElements.total++;
        data.totals.tabElements[isCorrect ? 'correct' : 'incorrect']++;
        // Process the next tab element.
        await testTabs(tabs, index + 1, listOrientation, listIsCorrect);
      }
      // Otherwise, i.e. if all tab elements have been tested:
      else {
        // Return whether the tablist is correct.
        return listIsCorrect;
      }
    };
    // Recursively tests tablists.
    const testTabLists = async tabLists => {
      // If any tablists remain to be tested:
      if (tabLists.length) {
        const firstTabList = tabLists[0];
        const orientation = (await firstTabList.getAttribute('aria-orientation')) || 'horizontal';
        const tabs = await firstTabList.$$('[role=tab]');
        // If the tablist contains at least 2 tab elements:
        if (tabs.length > 1) {
          // Test them.
          const isCorrect = await testTabs(tabs, 0, orientation, true);
          // Increment the data.
          data.totals.tabLists.total++;
          data.totals.tabLists[isCorrect ? 'correct' : 'incorrect']++;
          // Process the remaining tablists.
          await testTabLists(tabLists.slice(1));
        }
      }
    };
    // FUNCTION DEFINITIONS END
    testTabLists(tabLists);
  }
  return {result: data};
};
