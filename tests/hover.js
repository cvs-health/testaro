/*
  hover
  This test reports unexpected effects of hovering. The effects include additions and removals
  of visible elements, opacity changes, and unhoverable elements. Only Playwright-visible elements
  in the DOM that have 'A', 'BUTTON', and 'LI' tag names or have 'onmouseenter' or 'onmouseover'
  attributes are considered as hovering targets. The elements considered when the impacts of
  hovering are examined are the descendants of the great grandparent of the element hovered over
  if that element has the tag name 'A' or 'BUTTON', or otherwise the descendants of the element.
  The only visible elements counted as being added or removed by hovering are those with tag names
  'A', 'BUTTON', 'INPUT', and 'SPAN', and those with 'role="menuitem"' attributes. The test checks
  up to 4 times for hovering impacts at intervals of 0.3 second. Despite this delay, the test can
  make the execution time practical by randomly sampling targets instead of hovering over all of
  them. When sampling is performed, the results may vary from one execution to another. An element
  is reported as unhoverable when it fails the Playwright actionability checks for hovering, i.e.
  when it fails to be attached to the DOM, visible, stable (not or no longer animating), and
  able to receive events. All target candidates satisfy the first two conditions, so only the
  last two might fail. Playwright defines the ability to receive events as being the target of
  an action on the location where the center of the element is, rather than some other element
  with a higher zIndex value in the same location being the target.
*/

// CONSTANTS

// Selectors of active elements likely to be disclosed by a hover.
const targetSelectors = ['a', 'button', 'input', '[role=menuitem]', 'span']
.map(selector => `${selector}:visible`)
.join(', ');
// Initialize the result.
const data = {
  populationSize: 0,
  totals: {
    triggers: 0,
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
// Recursively finds and reports triggers and targets.
const find = async (withItems, page, triggers) => {
  // If any potential disclosure triggers remain:
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
      // Identify the root of a subtree likely to contain disclosed elements.
      let root = firstTrigger;
      const triggerText = await firstTrigger.textContent();
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
        if (triggerText === 'Issues') {
          console.log('Before hover on Issues:');
          console.log(await root.innerHTML());
        }
      }
      // Identify the visible active descendants of the root before the hover.
      const preVisibles = await root.$$(targetSelectors);
      if (triggerText === 'Issues' || triggerText === 'Press/Media') {
        console.log('PreVisible count:');
        console.log(preVisibles.length);
      }
      // Identify all the descendants of the root.
      const descendants = await root.$$('*');
      if (triggerText === 'Issues' || triggerText === 'Press/Media') {
        console.log('PreAll count:');
        console.log(descendants.length);
      }
      // Identify their opacities before the hover.
      const preOpacities = await page.evaluate(descendants => descendants.map(
        descendant => window.getComputedStyle(descendant).opacity
      ), descendants);
      try {
        // Hover over the potential trigger.
        await firstTrigger.hover({
          timeout: 500,
          noWaitAfter: true
        });
        // Repeatedly seeks the changes in descendants and their opacities.
        const getImpacts = async (interval, triesLeft) => {
          if (triesLeft--) {
            const hoverDescendants = await root.$$(targetSelectors);
            const hoverOpacities = await page.evaluate(descendants => descendants.map(
              descendant => {
                if (descendant) {
                  return window.getComputedStyle(descendant).opacity;
                }
                else {
                  return null;
                }
              }
            ), descendants);
            const additions = hoverDescendants.filter(element => ! descendants.includes(element));
            const removals = descendants.filter(element => ! hoverDescendants.includes(element));
            const changes = descendants.filter(
              (element, index) => {
                const hoverOpacity = hoverOpacities[index];
                return hoverOpacity && hoverOpacity !== preOpacities[index];
              }
            );
            if (additions.length || removals.length || changes.length) {
              return {
                additions,
                removals,
                changes
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
          if (triggerText === 'Issues' || triggerText === 'Press/Media') {
            console.log('Hover impacts:');
            console.log(`Additions: ${impacts.additions}`);
            console.log(`Removals: ${impacts.removals}`);
            console.log(`Opacity changes: ${impacts.changes}`);
          }
          // Count the pre-hover descendants of the root with impacted opacities.
          const opacityEffectCount = impacts.changes.length
          ? await page.evaluate(elements => elements.reduce(
            (total, current) => total + 1 + current.querySelectorAll('*').length, 0
          ), impacts.changes)
          : 0;
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
          // Increment the counts of triggers and targets.
          const {additions, removals, changes} = impacts;
          data.totals.triggers++;
          data.totals.additions += additions.length;
          data.totals.opacityChanges += changes.length;
          data.totals.opacityEffects += opacityEffectCount;
          // If details are to be reported:
          if (withItems) {
            // Report them.
            const triggerDataJSHandle = await page.evaluateHandle(args => {
              // Returns the text of an element.
              const textOf = (element, limit) => {
                const text = element.textContent.trim() || element.outerHTML.trim();
                return text.replace(/\s{2,}/sg, ' ').slice(0, limit);
              };
              const trigger = args[0];
              const impacts = args[1];
              const additions = impacts.additions.map(element => ({
                tagName: element.tagName,
                text: textOf(element, 50)
              }));
              const removals = impacts.removals.map(element => ({
                tagName: element.tagName,
                text: textOf(element, 50)
              }));
              const opacityChanges = impacts.changes.map(element => ({
                tagName: element.tagName,
                text: textOf(element, 50)
              }));
              return {
                tagName,
                id: trigger.id || '',
                text: textOf(trigger, 50),
                additions,
                removals,
                opacityChanges
              };
            }, [firstTrigger, impacts]);
            const triggerData = await triggerDataJSHandle.jsonValue();
            data.items.triggers.push(triggerData);
          }
        }
      }
      catch (error) {
        console.log(`ERROR hovering (${error.message})`);
        data.totals.unhoverables++;
        if (withItems) {
          data.items.unhoverables.push({
            tagName,
            id: firstTrigger.id || '',
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
      triggers: [],
      unhoverables: []
    };
  }
  // Identify the triggers.
  const selectors = [
    'body a:visible',
    'body button:visible',
    'body li:visible, body [onmouseenter]:visible',
    'body [onmouseover]:visible'
  ];
  const triggers = await page.$$(selectors.join(', '))
  .catch(error => {
    console.log(`ERROR getting hover triggers (${error.message})`);
    data.prevented = true;
    return [];
  });
  // If they number more than the sample size limit, sample them.
  const triggerCount = triggers.length;
  data.populationSize = triggerCount;
  const triggerSample = triggerCount > sampleSize ? getSample(triggers, sampleSize) : triggers;
  // Find and document the hover-triggered disclosures.
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
