/*
  hover
  This test reports unexpected impacts of hovering. The effects include additions and removals
  of visible elements, opacity changes, and unhoverable elements. The elements that are
  subjected to hovering (called “triggers”) are the Playwright-visible elements that have 'A',
  'BUTTON', or 'LI' tag names or have 'onmouseenter' or 'onmouseover' attributes. When such an
  element is hovered over, the test examines the impacts on descendants of the great grandparents
  of the elements with tag names 'A' and 'BUTTON', and otherwise the descendants of the elements
  themselves. Four impacts are counted: (1) an element is added or becomes visible, (2) an element
  is removed or becomes invisible, (3) the opacity of an element changes, and (4) the element is
  a descendant of an element whose opacity changes. The test checks up to 4 times for hovering
  impacts at intervals of 0.3 second. Despite this delay, the test can make the execution time
  practical by randomly sampling targets instead of hovering over all of them. When sampling is
  performed, the results may vary from one execution to another. An element is reported as
  unhoverable when it fails the Playwright actionability checks for hovering, i.e. fails to be
  attached to the DOM, visible, stable (not or no longer animating), and able to receive events.
  All triggers satisfy the first two conditions, so only the last two might fail. Playwright
  defines the ability to receive events as being the target of an action on the location where
  the center of the element is, rather than some other element with a higher zIndex value in
  the same location being the target.
*/

// CONSTANTS

// Initialize the result.
const data = {
  populationSize: 0,
  totals: {
    impactTriggers: 0,
    additions: 0,
    removals: 0,
    opacityChanges: 0,
    opacityEffects: 0,
    unhoverables: 0
  }
};

// FUNCTIONS

// Samples a population and returns the sample.
const getSample = (population, sampleSize) => {
  const popSize = population.length;
  if (sampleSize > 0 && sampleSize < popSize) {
    const sample = new Set();
    while (sample.size < sampleSize) {
      const index = Math.floor(popSize * Math.random());
      sample.add(population[index]);
    }
    return Array.from(sample);
  }
  else {
    return [];
  }
};
// Returns the text of an element.
const textOf = async (element, limit) => {
  let text = await element.textContent();
  text = text.trim() || await element.innerHTML();
  return text.trim().replace(/\s*/sg, '').slice(0, limit);
};
// Recursively reports impacts of hovering over triggers.
const find = async (withItems, page, triggers) => {
  // If any potential triggers remain:
  if (triggers.length) {
    // Identify the first of them.
    const firstTrigger = triggers[0];
    const tagNameJSHandle = await firstTrigger.getProperty('tagName')
    .catch(error => {
      console.log(`ERROR getting trigger tag name (${error.message})`);
      return '';
    });
    if (tagNameJSHandle) {
      const tagName = await tagNameJSHandle.jsonValue();
      // Identify the root of a subtree likely to contain impacted elements.
      let root = firstTrigger;
      if (['A', 'BUTTON'].includes(tagName)) {
        const rootJSHandle = await page.evaluateHandle(
          firstTrigger => {
            const parent = firstTrigger.parentElement || firstTrigger;
            const grandparent = parent.parentElement || parent;
            const greatGrandparent = grandparent.parentElement || parent;
            return greatGrandparent;
          },
          firstTrigger
        );
        root = rootJSHandle.asElement();
      }
      // Identify all the descendants of the root.
      const preDescendants = await root.$$('*');
      // Identify their opacities.
      const preOpacities = await page.evaluate(elements => elements.map(
        element => window.getComputedStyle(element).opacity
      ), preDescendants);
      try {
        // Hover over the trigger.
        await firstTrigger.hover({
          timeout: 500,
          noWaitAfter: true
        });
        // Repeatedly seeks impacts.
        const getImpacts = async (interval, triesLeft) => {
          if (triesLeft--) {
            const postDescendants = await root.$$('*');
            const remainerIndexes = await page.evaluate(args => {
              const preDescendants = args[0];
              const postDescendants = args[1];
              const remainerIndexes = preDescendants
              .map((element, index) => postDescendants.includes(element) ? index : -1)
              .filter(index => index > -1);
              return remainerIndexes;
            }, [preDescendants, postDescendants]);
            const additionCount = postDescendants.length - remainerIndexes.length;
            const removalCount = preDescendants.length - remainerIndexes.length;
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
            const opacityImpact = await page.evaluate(changers => changers.reduce(
              (total, current) => total + current.element.querySelectorAll('*').length, 0
            ), opacityChangers);
            if (additionCount || removalCount || opacityChangers.length) {
              return {
                additionCount,
                removalCount,
                opacityChangers,
                opacityImpact
              };
            }
            else {
              return await new Promise(resolve => {
                setTimeout(() => {
                  resolve(getImpacts(interval, triesLeft));
                }, interval);
              });
            }
          }
          else {
            return null;
          }
        };
        // Repeatedly seek impacts of the hover at intervals.
        const impacts = await getImpacts(300, 4);
        // If there were any:
        if (impacts) {
          // Hover over the upper-left corner of the page, to undo any impacts.
          await page.hover('body', {
            position: {
              x: 0,
              y: 0
            }
          });
          // Wait for any delayed and/or slowed hover reaction.
          await page.waitForTimeout(200);
          await root.waitForElementState('stable');
          // Increment the counts of triggers and impacts.
          const {additionCount, removalCount, opacityChangers, opacityImpact} = impacts;
          data.totals.impactTriggers++;
          data.totals.additions += additionCount;
          data.totals.removals += removalCount;
          data.totals.opacityChanges += opacityChangers.length;
          data.totals.opacityImpact += opacityImpact;
          // If details are to be reported:
          if (withItems) {
            // Report them.
            data.items.impactTriggers.push({
              tagName,
              text: await textOf(firstTrigger, 50),
              additions: additionCount,
              removals: removalCount,
              opacityChanges: opacityChangers.length,
              opacityImpact
            });
          }
        }
      }
      catch (error) {
        console.log(`ERROR hovering (${error.message})`);
        data.totals.unhoverables++;
        if (withItems) {
          const id = await firstTrigger.getAttribute('id');
          data.items.unhoverables.push({
            tagName,
            id: id || '',
            text: await textOf(firstTrigger, 50)
          });
        }
      }
    }
    // Process the remaining potential triggers.
    await find(withItems, page, triggers.slice(1));
  }
};
// Performs hover test and reports results.
exports.reporter = async (page, sampleSize = Infinity, withItems) => {
  // If details are to be reported:
  if (withItems) {
    // Add properties for details to the initialized result.
    data.items = {
      impactTriggers: [],
      unhoverables: []
    };
  }
  // Identify the triggers.
  const selectors = ['a', 'button', 'li', '[onmouseenter]', '[onmouseover]'];
  const triggers = await page.$$(selectors.map(selector => `body ${selector}:visible`).join(', '))
  .catch(error => {
    console.log(`ERROR getting hover triggers (${error.message})`);
    data.prevented = true;
    return [];
  });
  // If they number more than the sample size limit, sample them.
  const triggerCount = triggers.length;
  data.populationSize = triggerCount;
  const triggerSample = triggerCount > sampleSize ? getSample(triggers, sampleSize) : triggers;
  // Find and document the hover-triggered impacts.
  await find(withItems, page, triggerSample);
  // If the triggers were sampled:
  if (triggerCount > sampleSize) {
    // Change the totals to population estimates.
    const multiplier = triggerCount / sampleSize;
    Object.keys(data.totals).forEach(key => {
      data.totals[key] = Math.round(multiplier * data.totals[key]);
    });
  }
  // Return the result.
  return {result: data};
};
