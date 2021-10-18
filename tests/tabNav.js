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
  const tabListsData = [];
  // FUNCTION DEFINITIONS START
  const {allText} = require('../procs/test/allText');
  // Returns the index of the focused tab in an array of tabs.
  const focusedTab = async tabs => await page.evaluate(tabs => {
    const focus = document.activeElement;
    return tabs.indexOf(focus);
  }, tabs);
  // Recursively tests tabs and returns whether all tests passed.
  const testTabs = async (tabs, index, orientation, allCorrect) => {
    if (index < tabs.length) {
      data.totals.navigations.all.total++;
      data.totals.tabElements.total++;
      const currentTab = tabs[index];
      const isCorrect = true;
      const tabResults = {
        text: allText(currentTab),
        errors: []
      };
      await currentTab.press('Tab');
      data.totals.navigations.specific.tab.total++;
      const focusIndex = focusedTab(tabs);
      if (focusIndex === -1) {
        data.totals.navigations.all.correct++;
        data.totals.navigations.specific.tab.correct++;
      }
    }
  };
  // Recursively tests tablists.
  const testTabLists = async tabLists => {
    if (tabLists.length) {
      const firstTabList = tabLists[0];
      const orientation = (await firstTabList.getAttribute('aria-orientation')) || 'horizontal';
      const tabs = await firstTabList.$$('[role=tab]');
      const isCorrect = await testTabs(tabs, 0, orientation, true);
      await testTabLists(tabLists.slice(1));
    }
  };
  // FUNCTION DEFINITIONS END
  tabLists.forEach(async tabList => {
    const tabs = await tabList.$$('[role=tab]');
    if (tabs.length > 1) {
      const listData = {
        orientation: (,
        tabs
      };
      tabListsData.push(listData);
    }
  });
  // Test the navigation in each tablist.
  tabListsData.forEach(tabListData => {
    data.totals.tabLists.total++;
    tabListData.tabs.forEach(async (tab, index) => {
      const tabData = {

      };
      await tab.press('Tab');
      const focusIndex = focusedTab(tabs);
      if ()
    });
  });
    if (name) {
      if (radioData.name) {
        radioData.name.push(radio);
      }
      else {
        radioData.name = radio;
      }
    }
  });
  Object.keys(radioData).forEach(name => {
    if (radioData[name].length > 1) {
      radioData[name].forEach((radio, index) => {
        
      });
    }
  });
  const text = require('../procs/test/allText').allText(page, radio);
  // If itemization is required:
  // Get the result data.
  const dataJSHandle = await page.evaluateHandle(args => {
    const withItems = args[0];
    // FUNCTION DEFINITIONS START
    /*
      If itemization is required, define the textOf function to get element texts.
      The function body is read as a string and passed to this method because
      a string can be passed in but a function cannot.
    */
    const textOf = args[1] ? new Function('element', args[1]) : '';
    // Trim excess spaces from a string.
    const debloat = text => text.trim().replace(/\s+/g, ' ');
    // FUNCTION DEFINITIONS END
    // Initialize a report.
    const data = {
      totals: {
        total: 0,
        inSet: 0,
        percent: 0
      }
    };
    if (withItems) {
      data.items = {
        inSet: [],
        notInSet: []
      };
    }
    // Get an array of all fieldset elements.
    const fieldsets = Array.from(document.body.querySelectorAll('fieldset'));
    // Get an array of those with valid legends.
    const legendSets = fieldsets.filter(fieldset => {
      const firstChild = fieldset.firstElementChild;
      return firstChild
      && firstChild.tagName === 'LEGEND'
      && debloat(firstChild.textContent).length;
    });
    // Get an array of the radio buttons in those with homogeneous radio buttons.
    const setRadios = legendSets.reduce((radios, currentSet) => {
      const currentRadios = Array.from(currentSet.querySelectorAll('input[type=radio]'));
      const radioCount = currentRadios.length;
      if (radioCount == 1) {
        radios.push(currentRadios[0]);
      }
      else if (radioCount > 1) {
        const radioName = currentRadios[0].name;
        if (radioName && currentRadios.slice(1).every(radio => radio.name === radioName)) {
          radios.push(...currentRadios);
        }
      }
      return radios;
    }, []);
    // Get an array of all radio buttons.
    const allRadios = Array.from(document.body.querySelectorAll('input[type=radio'));
    // Tabulate the results.
    const totals = data.totals;
    totals.total = allRadios.length;
    totals.inSet = setRadios.length;
    totals.percent = totals.total ? Math.floor(100 * totals.inSet / totals.total) : 'N.A.';
    // If itemization is required:
    if (withItems) {
      // Add it to the results.
      const nonSetRadios = allRadios.filter(radio => ! setRadios.includes(radio));
      const items = data.items;
      items.inSet = setRadios.map(radio => textOf(radio));
      items.notInSet = nonSetRadios.map(radio => textOf(radio));
    }
    return {result: data};
  }, args);
  return await dataJSHandle.jsonValue();
};
