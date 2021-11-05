/*
  tabNav
  This test reports nonstandard keyboard navigation among tab elements in tab lists.
  Standards are based on https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel.
*/
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
    }, tabs)
    .catch(error => {
      console.log(`ERROR: could not find focused tab (${error.message})`);
      return -1;
    });
    // Tests a navigation on a tab element.
    const testKey = async (
      tabs, tabElement, keyName, keyProp, goodIndex, elementIsCorrect, itemData
    ) => {
      let pressed = true;
      // Click the tab element, to make the focus on it effective.
      await tabElement.click({timeout: 1500})
      .catch(error => {
        console.log(`ERROR: could not click tab element ${itemData.text} (${error.message})`);
        pressed = false;
      });
      if (pressed) {
        // Refocus the tab element and press the specified key (page.keyboard.press may fail).
        await tabElement.press(keyName)
        .catch(error => {
          console.log(`ERROR: could not press ${keyName} (${error.message})`);
          pressed = false;
        });
        if (pressed) {
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
            // Update the element status to incorrect.
            elementIsCorrect = false;
            // If itemization is required:
            if (withItems) {
              // Update the element report.
              itemData.navigationErrors.push(keyName);
            }
          }
          return elementIsCorrect;
        }
        else {
          return false;
        }
      }
    };
    // Returns the index to which an arrow key should move the focus.
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
    /*
      Recursively tests tablist tab elements (per
      https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel)
    */
    const testTabs = async (tabs, index, listOrientation, listIsCorrect) => {
      const tabCount = tabs.length;
      // If any tab elements remain to be tested:
      if (index < tabCount) {
        // Increment the reported count of tab elements.
        data.totals.tabElements.total++;
        // Identify the tab element to be tested.
        const currentTab = tabs[index];
        // Initialize it as correct.
        let isCorrect = true;
        const itemData = {};
        // If itemization is required:
        if (withItems) {
          let found = true;
          // Initialize a report on the element.
          itemData.tagName = await page.evaluate(element => element.tagName, currentTab)
          .catch(error => {
            console.log(`ERROR: could not get tag name (${error.message})`);
            found = false;
            return 'ERROR: not found';
          });
          if (found) {
            itemData.text = await allText(page, currentTab);
            itemData.navigationErrors = [];
          }
        }
        // Test the element with each navigation key.
        isCorrect = await testKey(tabs, currentTab, 'Tab', 'tab', -1, isCorrect, itemData);
        isCorrect = await testKey(
          tabs,
          currentTab,
          'ArrowLeft',
          'left',
          arrowTarget(index, tabCount, listOrientation, 'left'),
          isCorrect,
          itemData
        );
        isCorrect = await testKey(
          tabs,
          currentTab,
          'ArrowRight',
          'right',
          arrowTarget(index, tabCount, listOrientation, 'right'),
          isCorrect,
          itemData
        );
        isCorrect = await testKey(
          tabs,
          currentTab,
          'ArrowUp',
          'up',
          arrowTarget(index, tabCount, listOrientation, 'up'),
          isCorrect,
          itemData
        );
        isCorrect = await testKey(
          tabs,
          currentTab,
          'ArrowDown',
          'down',
          arrowTarget(index, tabCount, listOrientation, 'down'),
          isCorrect,
          itemData
        );
        isCorrect = await testKey(tabs, currentTab, 'Home', 'home', 0, isCorrect, itemData);
        isCorrect = await testKey(
          tabs, currentTab, 'End', 'end', tabCount - 1, isCorrect, itemData
        );
        // Update the tablist status (&&= operator from ES 2021 rejected by node 14).
        listIsCorrect = listIsCorrect && isCorrect;
        // Increment the data.
        data.totals.tabElements[isCorrect ? 'correct' : 'incorrect']++;
        if (withItems) {
          data.tabElements[isCorrect ? 'correct' : 'incorrect'].push(itemData);
        }
        // Process the next tab element.
        return await testTabs(tabs, index + 1, listOrientation, listIsCorrect);
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
        let orientation = await firstTabList.getAttribute('aria-orientation')
        .catch(error=> {
          console.log(`ERROR: could not get tab-list orientation (${error.message})`);
          return 'ERROR';
        });
        if (! orientation) {
          orientation = 'horizontal';
        }
        if (orientation !== 'ERROR') {
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
      }
    };
    // FUNCTION DEFINITIONS END
    await testTabLists(tabLists);
  }
  return {result: data};
};
