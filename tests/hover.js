/*
  hover
  This test reports unexpected effects of hovering. The effects include elements that are made
  visible, elements whose opacities are changed, elements with ancestors whose opacities are
  changed, and elements that cannot be hovered over. Only Playwright-visible elements in the
  DOM that have 'A', 'BUTTON', and 'LI' tag names or have 'onmouseenter' or 'onmouseover' attributes
  are considered as hovering targets. The elements considered when the effects of hovering are
  examined are the descendants of the grandparent of the element hovered over if that element
  has the tag name 'A' or 'BUTTON' or otherwise the descendants of the element. The only
  elements counted as being made visible by hovering are those with tag names 'A', 'BUTTON',
  'INPUT', and 'SPAN', and those with 'role="menuitem"' attributes. The test waits 700 ms after
  each hover in case of delayed effects. Despite this delay, the test can make the execution
  time practical by randomly sampling targets instead of hovering over all of them. When
  sampling is performed, the results may vary from one execution to another. An element is
  reported as unhoverable when it fails the Playwright actionability checks for hovering, i.e.
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
    madeVisible: 0,
    opacityChanged: 0,
    opacityAffected: 0,
    unhoverables: 0
  }
};

// VARIABLES

// Counter.
let elementsChecked = 0;

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
      if (['A', 'BUTTON'].includes(tagName)) {
        const rootJSHandle = await page.evaluateHandle(
          firstTrigger => {
            const parent = firstTrigger.parentElement || firstTrigger;
            const grandparent = parent.parentElement || parent;
            return grandparent;
          },
          firstTrigger
        );
        root = rootJSHandle.asElement();
      }
      // Identify the visible active descendants of the root before the hover.
      const preVisibles = await root.$$(targetSelectors);
      // Identify all the descendants of the root.
      const descendants = await root.$$('*');
      // Identify their opacities before the hover.
      const preOpacities = await page.evaluate(
        elements => elements.map(el => window.getComputedStyle(el).opacity), descendants
      );
      try {
        // Hover over the potential trigger.
        await firstTrigger.hover({timeout: 700});
        // Identify whether it is coded as controlling other elements.
        const isController = await page.evaluate(
          element => element.ariaHasPopup || element.hasAttribute('aria-controls'), firstTrigger
        );
        // Wait for any delayed and/or slowed hover reaction, longer if coded as a controller.
        await page.waitForTimeout(isController ? 1200 : 600);
        await root.waitForElementState('stable');
        // Identify the visible active descendants of the root during the hover.
        const postVisibles = await root.$$(targetSelectors);
        // Identify the opacities of the descendants of the root during the hover.
        const postOpacities = await page.evaluate(
          elements => elements.map(el => window.getComputedStyle(el).opacity), descendants
        );
        // Identify the elements with opacity changes.
        const opacityTargets = descendants
        .filter((descendant, index) => postOpacities[index] !== preOpacities[index]);
        // Count them and their descendants.
        const opacityAffected = opacityTargets.length
          ? await page.evaluate(elements => elements.reduce(
            (total, current) => total + 1 + current.querySelectorAll('*').length, 0
          ), opacityTargets)
          : 0;
        // If hovering disclosed any element or changed any opacity:
        if (postVisibles.length > preVisibles.length || opacityAffected) {
          // Preserve the lengthened reaction wait, if any, for the next 5 tries.
          if (elementsChecked < 11) {
            elementsChecked = 5;
          }
          // Hover over the upper-left corner of the page, to undo any hover reactions.
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
          data.totals.triggers++;
          const madeVisible = Math.max(0, postVisibles.length - preVisibles.length);
          data.totals.madeVisible += madeVisible;
          data.totals.opacityChanged += opacityTargets.length;
          data.totals.opacityAffected += opacityAffected;
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
              const preVisibles = args[1];
              const postVisibles = args[2];
              const madeVisible = postVisibles
              .filter(el => ! preVisibles.includes(el))
              .map(el => ({
                tagName: el.tagName,
                text: textOf(el, 50)
              }));
              const opacityChanged = args[3].map(el => ({
                tagName: el.tagName,
                text: textOf(el, 50)
              }));
              return {
                tagName: trigger.tagName,
                id: trigger.id || '',
                text: textOf(trigger, 50),
                madeVisible,
                opacityChanged
              };
            }, [firstTrigger, preVisibles, postVisibles, opacityTargets]);
            const triggerData = await triggerDataJSHandle.jsonValue();
            data.items.triggers.push(triggerData);
          }
        }
      }
      catch (error) {
        console.log('ERROR hovering');
        data.totals.unhoverables++;
        if (withItems) {
          data.items.unhoverables.push({
            tagName: tagName,
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
