/*
  hover
  This test reports unexpected impacts of hovering. The effects include additions and removals
  of visible elements, opacity changes, unhoverable elements, and nonstandard hover cursors.
  The elements that are subjected to hovering (called “triggers”) are the Playwright-visible
  elements that have 'A', 'BUTTON', or (if not with role=menuitem) 'LI' tag names or have
  'onmouseenter' or 'onmouseover' attributes.

  When a trigger is hovered over, the test examines the impacts on descendants of the great
  grandparents of triggers with tag names 'A' and 'BUTTON', grandparents of triggers with tag
  name 'LI', and otherwise the descendants of the triggers themselves. Four impacts are counted:
  (1) an element is added or becomes visible, (2) an element is removed or becomes invisible, (3)
  the opacity of an element changes, and (4) the element is a descendant of an element whose opacity
  changes. The test checks up to 4 times for hovering impacts at intervals of 0.3 second.

  Despite the delay, the test can make the execution time practical by randomly sampling triggers
  instead of hovering over all of them. When sampling is performed, the results may vary from one
  execution to another. Because hover impacts typically occur near the beginning of a page with
  navigation menus, the probability of the inclusion of a trigger in a sample decreases with the
  index of the trigger.

  An element is reported as unhoverable when it fails the Playwright actionability checks for
  hovering, i.e. fails to be attached to the DOM, visible, stable (not or no longer animating), and
  able to receive events. All triggers satisfy the first two conditions, so only the last two might
  fail. Playwright defines the ability to receive events as being the target of an action on the
  location where the center of the element is, rather than some other element with a higher zIndex
  value in the same location being the target.
*/

// VARIABLES

let hasTimedOut = false;

// FUNCTIONS

// Draws a location-weighted sample of triggers.
const getSample = (population, sampleSize) => {
  const popSize = population.length;
  if (sampleSize < popSize) {
    const WeightedPopulation = population.map((trigger, index) => {
      const weight = 1 + Math.sin(Math.PI * index / popSize + Math.PI / 2);
      const priority = weight * Math.random();
      return [trigger, index, priority];
    });
    const sortedPopulation = WeightedPopulation.sort((a, b) => b[2] - a[2]);
    const sample = sortedPopulation.slice(0, sampleSize);
    const domOrderSample = sample.sort((a, b) => a[1] - b[1]);
    return domOrderSample.map(trigger => trigger[0]);
  }
  else {
    return population;
  }
};
// Returns the text of an element.
const textOf = async (element, limit) => {
  let text = await element.textContent();
  text = text.trim() || await element.innerHTML();
  return text.trim().replace(/\s+/sg, ' ').slice(0, limit);
};
// Returns the impacts of hovering over a sampled trigger.
const getImpacts = async (
  interval, triesLeft, root, page, preDescendants, preOpacities
) => {
  // If the allowed trial count has not yet been exhausted:
  if (triesLeft-- && ! hasTimedOut) {
    // Get the collection of descendants of the root.
    const postDescendants = await root.$$(':visible');
    // Identify the prior descendants of the root still in existence.
    const remainerIndexes = await page.evaluate(args => {
      const preDescendants = args[0];
      const postDescendants = args[1];
      const remainerIndexes = preDescendants
      .map((element, index) => postDescendants.includes(element) ? index : -1)
      .filter(index => index > -1);
      return remainerIndexes;
    }, [preDescendants, postDescendants]);
    // Get the impacts of the hover event.
    const additions = postDescendants.length - remainerIndexes.length;
    const removals = preDescendants.length - remainerIndexes.length;
    const remainers = [];
    for (const index of remainerIndexes) {
      remainers.push({
        element: preDescendants[index],
        preOpacity: preOpacities[index],
        postOpacity: await page.evaluate(
          element => window.getComputedStyle(element).opacity, preDescendants[index]
        )
      });
    }
    const opacityChangers = remainers
    .filter(remainer => remainer.postOpacity !== remainer.preOpacity);
    const opacityImpact = opacityChangers
      ? await page.evaluate(changers => changers.reduce(
        (total, current) => total + current.element.querySelectorAll('*').length, 0
      ), opacityChangers)
      : 0;
    // If there are any impacts:
    if (additions || removals || opacityChangers.length) {
      // Return them.
      return {
        additions,
        removals,
        opacityChanges: opacityChangers.length,
        opacityImpact
      };
    }
    // Otherwise, i.e. if there are no impacts:
    else {
      // Try again.
      return await new Promise(resolve => {
        setTimeout(() => {
          resolve(getImpacts(interval, triesLeft, root, page, preDescendants, preOpacities));
        }, interval);
      });
    }
  }
  // Otherwise, i.e. if the allowed trial count has been exhausted:
  else {
    // Report non-impact.
    return null;
  }
};
// Returns the hover-related style properties of a trigger.
const getHoverStyles = async (page, element) => await page.evaluate(
  element => {
    const {cursor, outline, color, backgroundColor} = window.getComputedStyle(element);
    return {
      cursor: cursor.replace(/^.+, */, ''),
      outline,
      color,
      backgroundColor
    };
  }, element
);
// Recursively adds estimated and itemized impacts of hovering over triggers to data.
const find = async (data, withItems, page, sample) => {
  // If any triggers remain and the test has not timed out:
  if (sample.length && ! hasTimedOut) {
    // Get and report the impacts until and unless the test times out.
    try {
      // Identify the first trigger.
      const firstTrigger = sample[0];
      const tagNameJSHandle = await firstTrigger.getProperty('tagName')
      .catch(() => '');
      if (tagNameJSHandle) {
        const tagName = await tagNameJSHandle.jsonValue();
        // Identify the root of a subtree likely to contain impacted elements.
        let root = firstTrigger;
        if (['A', 'BUTTON', 'LI'].includes(tagName)) {
          const rootJSHandle = await page.evaluateHandle(
            trigger => {
              const parent = trigger.parentElement || trigger;
              const grandparent = parent.parentElement || parent;
              const greatGrandparent = grandparent.parentElement || parent;
              return trigger.tagName === 'LI' ? grandparent : greatGrandparent;
            },
            firstTrigger
          );
          root = rootJSHandle.asElement();
        }
        // Identify all the visible descendants of the root.
        const preDescendants = await root.$$(':visible');
        // Identify their opacities.
        const preOpacities = await page.evaluate(elements => elements.map(
          element => window.getComputedStyle(element).opacity
        ), preDescendants);
        // Get the style properties of the trigger.
        const triggerPreStyles = await getHoverStyles(page, firstTrigger);
        const multiplier = data.sampling.triggers / data.sampling.triggerSample;
        const itemData = {
          tagName,
          id: (await firstTrigger.getAttribute('id')) || '',
          text: await textOf(firstTrigger, 100)
        };
        try {
          // Hover over the trigger.
          await firstTrigger.hover({
            timeout: 500,
            noWaitAfter: true
          });
          // Repeatedly seek impacts of the hover at intervals.
          const impacts = await getImpacts(
            300, 4, root, page, preDescendants, preOpacities, firstTrigger
          );
          // Get the style properties of the trigger.
          const triggerPostStyles = await getHoverStyles(page, firstTrigger);
          // Add cursor and other style defects to the data.
          const cursor = triggerPreStyles.cursor;
          // If the trigger has no cursor:
          if (cursor === 'none') {
            // Add this fact to the data.
            data.totals.noCursors += multiplier;
            if (withItems) {
              data.items.noCursors.push(itemData);
            }
          }
          // If the trigger has an improper cursor:
          if (
            tagName === 'A' && cursor !== 'pointer'
            || tagName === 'BUTTON' && cursor !== 'default'
          ){
            // Add this fact to the data.
            data.totals.badCursors += multiplier;
            if (withItems) {
              data.items.badCursors.push(itemData);
            }
          }
          // If hover indication is illicit but is present:
          if (
            tagName === 'LI'
            && JSON.stringify(triggerPostStyles) !== JSON.stringify(triggerPreStyles)
          ) {
            // Add this fact to the data.
            data.totals.badIndicators += multiplier;
            if (withItems) {
              data.items.badIndicators.push(itemData);
            }
          }
          // If there were any impacts:
          if (impacts) {
            // Hover over the upper-left corner of the page, to undo any impacts.
            await page.hover('body', {
              position: {
                x: 0,
                y: 0
              },
              timeout: 500,
              force: true,
              noWaitAfter: true
            });
            // Wait for any delayed and/or slowed reaction.
            await page.waitForTimeout(200);
            await root.waitForElementState('stable');
            // Increment the estimated counts of triggers and impacts.
            const {additions, removals, opacityChanges, opacityImpact} = impacts;
            if (hasTimedOut) {
              return Promise.resolve('');
            }
            else {
              data.totals.impactTriggers += multiplier;
              data.totals.additions += additions * multiplier;
              data.totals.removals += removals * multiplier;
              data.totals.opacityChanges += opacityChanges * multiplier;
              data.totals.opacityImpact += opacityImpact * multiplier;
              // If details are to be reported:
              if (withItems) {
                // Add them to the data.
                data.items.impactTriggers.push({
                  tagName,
                  id: itemData.id,
                  text: await textOf(firstTrigger[0], 100),
                  additions,
                  removals,
                  opacityChanges,
                  opacityImpact
                });
              }
            }
          }
        }
        catch (error) {
          console.log(`ERROR hovering (${error.message.replace(/\n.+/s, '')})`);
          if (hasTimedOut) {
            return Promise.resolve('');
          }
          else {
            data.totals.unhoverables += multiplier;
            if (withItems) {
              try {
                data.items.unhoverables.push(itemData);
              }
              catch(error) {
                console.log('ERROR itemizing unhoverable element');
              }
            }
          }
        }
      }
      // Process the remaining potential triggers.
      await find(data, withItems, page, sample.slice(1));
    }
    catch(error) {
      console.log(`ERROR: Test quit when remaining sample size was ${sample.length}`);
    }
  }
  else {
    return Promise.resolve('');
  }
};
// Performs the hover test and reports results.
exports.reporter = async (page, withItems, sampleSize = 20) => {
  // Initialize the result.
  let data = {
    sampling: {
      triggers: 0,
      triggerSample: 0,
    },
    totals: {
      impactTriggers: 0,
      additions: 0,
      removals: 0,
      opacityChanges: 0,
      opacityImpact: 0,
      unhoverables: 0,
      noCursors: 0,
      badCursors: 0,
      badIndicators: 0
    }
  };
  // If details are to be reported:
  if (withItems) {
    // Add properties for details to the initialized result.
    data.items = {
      impactTriggers: [],
      unhoverables: [],
      noCursors: [],
      badCursors: [],
      badIndicators: []
    };
  }
  // Identify the triggers.
  const selectors = ['a', 'button', 'li:not([role=menuitem])', '[onmouseenter]', '[onmouseover]'];
  const triggers = await page.$$(selectors.map(selector => `body ${selector}:visible`).join(', '))
  .catch(error => {
    console.log(`ERROR getting hover triggers (${error.message})`);
    data.prevented = true;
    return [];
  });
  data.sampling.triggers = triggers.length;
  // Get the sample.
  const sample = getSample(triggers, sampleSize);
  data.sampling.triggerSample = sample.length;
  // Set a time limit to cover possible 2 seconds per trigger.
  const timeLimit = Math.round(2.8 * sample.length + 2);
  const timeout = setTimeout(async () => {
    await page.close();
    console.log(
      `ERROR: hover test on sample of ${sample.length} triggers timed out at ${timeLimit} seconds; page closed`
    );
    hasTimedOut = true;
    data = {
      prevented: true,
      error: 'ERROR: hover test timed out'
    };
    clearTimeout(timeout);
  }, 1000 * timeLimit);
  // Find and document the style defects and impacts of the sampled triggers.
  if (sample.length && ! hasTimedOut) {
    await find(data, withItems, page, sample);
  }
  clearTimeout(timeout);
  // Round the reported totals.
  if (! hasTimedOut) {
    Object.keys(data.totals).forEach(key => {
      data.totals[key] = Math.round(data.totals[key]);
    });
  }
  const severity = {
    impactTriggers: 3,
    additions: 1,
    removals: 2,
    opacityChanges: 1,
    opacityImpact: 0,
    unhoverables: 3,
    noCursors: 3,
    badCursors: 2,
    badIndicators: 2
  };
  const what = {
    impactTriggers: 'Hovering over the element has unexpected effects',
    unhoverables: 'Operable element cannot be hovered over',
    noCursors: 'Hoverable element hides the mouse cursor',
    badCursors: 'Link or button makes the hovering mouse cursor nonstandard',
    badIndicators: 'List item changes when hovered over'
  };
  const totals = [0, 0, 0, 0];
  Object.keys(data.totals).forEach(category => {
    totals[severity[category]] += data.totals[category];
  });
  const standardInstances = [];
  if (data.items) {
    Object.keys(data.items).forEach(category => {
      data.items[category].forEach(item => {
        standardInstances.push({
          ruleID: 'hover',
          what: what[category],
          ordinalSeverity: severity[category],
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
    });
  }
  else if (totals.some(total => total)) {
    standardInstances.push({
      ruleID: 'hover',
      what: 'Hovering behaves unexpectedly',
      ordinalSeverity: totals.reduce((max, current, index) => current ? index : max, 0),
      count: Object.values(data.totals).reduce((total, current) => total + current),
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
  // Return the result.
  return {
    data,
    totals,
    standardInstances
  };
};
