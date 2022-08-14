/*
  hover
  This test reports unexpected impacts of hovering. The effects include additions and removals
  of visible elements, opacity changes, and unhoverable elements. The elements that are
  subjected to hovering (called “triggers”) are the Playwright-visible elements that have 'A',
  'BUTTON', or 'LI' tag names or have 'onmouseenter' or 'onmouseover' attributes. When such an
  element is hovered over, the test examines the impacts on descendants of the great grandparents
  of the elements with tag names 'A' and 'BUTTON', grandparents of elements with tag name 'LI',
  and otherwise the descendants of the elements themselves. Four impacts are counted: (1) an
  element is added or becomes visible, (2) an element is removed or becomes invisible, (3) the
  opacity of an element changes, and (4) the element is a descendant of an element whose opacity
  changes. The test checks up to 4 times for hovering impacts at intervals of 0.3 second.

  Despite this delay, the test can make the execution time practical by randomly sampling triggers
  instead of hovering over all of them. When sampling is performed, the results may vary from one
  execution to another. Because hover impacts typically occur near the beginning of a page,
  sampling is governed by three optional parameters (defaults in parentheses):
    headSize (0): the size of an initial subset of triggers (“head”)
    headSampleSize (-1): the size of the sample to be drawn from the head
    tailSampleSize (-1): the size of the sample to be drawn from the remainder of the page
  A sample size of -1 means that there is no sampling, and the entire population is tested.

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

// Samples a population and returns the sample.
const getSample = (population, sampleSize) => {
  const popSize = population.length;
  if (sampleSize === 0) {
    return [];
  }
  else if (sampleSize > 0 && sampleSize < popSize) {
    const popData = [];
    for (const trigger of population) {
      popData.push({
        trigger,
        sorter: Math.random()
      });
    };
    popData.sort((a, b) => a.sorter - b.sorter);
    return popData.slice(0, sampleSize).map(obj => obj.trigger);
  }
  else {
    return population;
  }
};
// Returns the text of an element.
const textOf = async (element, limit) => {
  let text = await element.textContent();
  text = text.trim() || await element.innerHTML();
  return text.trim().replace(/\s*/sg, '').slice(0, limit);
};
// Recursively reports impacts of hovering over triggers.
const find = async (data, withItems, page, region, sample, popRatio) => {
  // If any potential triggers remain and the test has not timed out:
  if (sample.length && ! hasTimedOut) {
    // Get and report the impacts until and unless the test times out.
    try {
      // Identify the first of them.
      const firstTrigger = sample[0];
      const tagNameJSHandle = await firstTrigger.getProperty('tagName')
      .catch(error => '');
      if (tagNameJSHandle) {
        const tagName = await tagNameJSHandle.jsonValue();
        // Identify the root of a subtree likely to contain impacted elements.
        let root = firstTrigger;
        if (['A', 'BUTTON', 'LI'].includes(tagName)) {
          const rootJSHandle = await page.evaluateHandle(
            firstTrigger => {
              const parent = firstTrigger.parentElement || firstTrigger;
              const grandparent = parent.parentElement || parent;
              const greatGrandparent = grandparent.parentElement || parent;
              return firstTrigger.tagName === 'LI' ? grandparent : greatGrandparent;
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
        try {
          // Hover over the trigger.
          await firstTrigger.hover({
            timeout: 500,
            noWaitAfter: true
          });
          // FUNCTION DEFINITION START
          // Repeatedly seeks impacts.
          const getImpacts = async (interval, triesLeft) => {
            // If the allowed trial count has not yet been exhausted:
            if (triesLeft-- && ! hasTimedOut) {
              // Get the collection of descendants of the root.
              const postDescendants = await root.$$(':visible');
              // Identify the prior descandants of the root still in existence.
              const remainerIndexes = await page.evaluate(args => {
                const preDescendants = args[0];
                const postDescendants = args[1];
                const remainerIndexes = preDescendants
                .map((element, index) => postDescendants.includes(element) ? index : -1)
                .filter(index => index > -1);
                return remainerIndexes;
              }, [preDescendants, postDescendants]);
              // Get the count of elements added by the hover event.
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
              const opacityImpact = opacityChangers ? await page.evaluate(changers => changers.reduce(
                (total, current) => total + current.element.querySelectorAll('*').length, 0
              ), opacityChangers) : 0;
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
          // FUNCTION DEFINITION END
          // Repeatedly seek impacts of the hover at intervals.
          const impacts = await getImpacts(300, 4);
          // If there were any:
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
            // Wait for any delayed and/or slowed hover reaction.
            await page.waitForTimeout(200);
            await root.waitForElementState('stable');
            // Increment the counts of triggers and impacts.
            const {additionCount, removalCount, opacityChangers, opacityImpact} = impacts;
            if (hasTimedOut) {
              return Promise.resolve('');
            }
            else {
              data.totals.impactTriggers += popRatio;
              data.totals.additions += popRatio * additionCount;
              data.totals.removals += popRatio * removalCount;
              data.totals.opacityChanges += popRatio * opacityChangers.length;
              data.totals.opacityImpact += popRatio * opacityImpact;
              // If details are to be reported:
              if (withItems) {
                // Report them.
                data.items[region].impactTriggers.push({
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
        }
        catch (error) {
          console.log(`ERROR hovering (${error.message.replace(/\n.+/s, '')})`);
          if (hasTimedOut) {
            return Promise.resolve('');
          }
          else {
            data.totals.unhoverables++;
            if (withItems) {
              try {
                const id = await firstTrigger.getAttribute('id');
                data.items[region].unhoverables.push({
                  tagName,
                  id: id || '',
                  text: await textOf(firstTrigger, 50)
                });
              }
              catch(error) {
                console.log('ERROR itemizing unhoverable element');
              }
            }
          }
        }
      }
      // Process the remaining potential triggers.
      await find(data, withItems, page, region, sample.slice(1), popRatio);
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
exports.reporter = async (
  page, headSize = 0, headSampleSize = -1, tailSampleSize = -1, withItems
) => {
  // Initialize the result.
  let data = {
    totals: {
      triggers: 0,
      headTriggers: 0,
      tailTriggers: 0,
      impactTriggers: 0,
      additions: 0,
      removals: 0,
      opacityChanges: 0,
      opacityImpact: 0,
      unhoverables: 0
    }
  };
  // If details are to be reported:
  if (withItems) {
    // Add properties for details to the initialized result.
    data.items = {
      head: {
        impactTriggers: [],
        unhoverables: []
      },
      tail: {
        impactTriggers: [],
        unhoverables: []
      }
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
  // Classify them into head and tail triggers.
  const headTriggers = triggers.slice(0, headSize);
  const tailTriggers = triggers.slice(headSize);
  const headTriggerCount = headTriggers.length;
  const tailTriggerCount = tailTriggers.length;
  data.totals.triggers = headTriggerCount + tailTriggerCount;
  data.totals.headTriggers = headTriggerCount;
  data.totals.tailTriggers = tailTriggerCount;
  // Get the head and tail samples.
  const headSample = getSample(headTriggers, headSampleSize);
  const tailSample = tailSampleSize === -1 ? tailTriggers : getSample(tailTriggers, tailSampleSize);
  // Set a time limit to handle pages that slow the operations of this test.
  const timeLimit = Math.round(1.3 * (headSample.length + tailSample.length));
  const timeout = setTimeout(async () => {
    await page.close();
    console.log(
      `ERROR: hover test timed out at ${timeLimit} seconds; page closed`
    );
    hasTimedOut = true;
    data = {
      prevented: true,
      error: 'ERROR: hover test timed out'
    };
    clearTimeout(timeout);
  }, 1000 * timeLimit);
  // Find and document the impacts.
  if (headSample.length && ! hasTimedOut) {
    await find(data, withItems, page, 'head', headSample, headTriggerCount / headSample.length);
  }
  if (tailSample.length && ! hasTimedOut) {
    await find(data, withItems, page, 'tail', tailSample, tailTriggerCount / tailSample.length);
  }
  clearTimeout(timeout);
  // Round the reported totals.
  if (! hasTimedOut) {
    Object.keys(data.totals).forEach(key => {
      data.totals[key] = Math.round(data.totals[key]);
    });
  }
  // Return the result.
  return {result: data};
};
