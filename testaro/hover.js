/*
  hover
  This test reports unexpected impacts of hovering on the visible page. Impacts are measured by
  pixel changes outside the hovered element and by unhoverability.
  
  The elements that are subjected to hovering (called “triggers”) are the Playwright-visible
  elements that have 'A', 'BUTTON', or (if not with role=menuitem) 'LI' tag names or have
  'onmouseenter' or 'onmouseover' attributes.

  Despite the delay, the test can make the execution time practical by randomly sampling triggers
  instead of hovering over all of them. When sampling is performed, the results may vary from one
  execution to another. Because hover impacts typically occur near the beginning of a page with
  navigation menus, the probability of the inclusion of a trigger in a sample decreases with the
  index of the trigger.

  Pixel changes: If no pixel changes occur immediately, the page is examined once more, after 0.5 second.
  The greater the fraction of changed pixels, the greater the ordinal severity.

  Unhoverability: An element is reported as unhoverable when it fails the Playwright actionability
  checks for hovering, i.e. fails to be attached to the DOM, visible, stable (not or no longer
  animating), and able to receive events. All triggers satisfy the first two conditions, so only the
  last two might fail. Playwright defines the ability to receive events as being the target of an
  action on the location where the center of the element is, rather than some other element with a
  higher zIndex value in the same location being the target.

  If an element is unhoverable, testing stops and the sample size is changed to the size of the
  subsample that was tested before the unhoverability occurred.

  WARNING: This test uses the Playwright page.screenshot method, which produces incorrect results
  when the browser type is chromium and is not implemented for the firefox browser type. The only
  browser type usable with this test is webkit.
*/

// IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');
// Module to get pixel changes between two times.
const {visChange} = require('../procs/visChange');

// FUNCTIONS

// Draws a location-weighted sample of triggers.
const getSample = (population, sampleSize) => {
  const popSize = population.length;
  // If the sample is smaller than the population:
  if (sampleSize < popSize) {
    // Assign to each trigger a priority randomly decreasing with its index.
    const WeightedPopulation = population.map((trigger, index) => {
      const weight = 1 + Math.sin(Math.PI * index / popSize + Math.PI / 2);
      const priority = weight * Math.random();
      return [index, priority];
    });
    // Return the indexes of the triggers with the highest priorities.
    const sortedPopulation = WeightedPopulation.sort((a, b) => b[1] - a[1]);
    const sample = sortedPopulation.slice(0, sampleSize);
    const domOrderSample = sample.sort((a, b) => a[0] - b[0]);
    return domOrderSample.map(trigger => trigger[0]);
  }
  // Otherwise, i.e. if the sample is at least as large as the population:
  else {
    // Return the population indexes.
    return population.map((trigger, index) => index);
  }
};
// Performs the hover test and reports results.
exports.reporter = async (page, withItems, sampleSize = 20) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Identify the triggers.
  const selectors = ['a', 'button', 'li:not([role=menuitem])', '[onmouseenter]', '[onmouseover]'];
  const locAll = page.locator(selectors.map(selector => `body ${selector}:visible`).join(', '));
  const locsAll = await locAll.all();
  // Get the population-to-sample ratio.
  const psRatio = Math.max(1, locsAll.length / sampleSize);
  // Get a sample of them.
  const sampleIndexes = getSample(locsAll, sampleSize);
  const sample = locsAll.filter((loc, index) => sampleIndexes.includes(index));
  // Set a time limit to cover possible 1 second per trigger.
  const timeLimit = Math.round(1.8 * sample.length + 2);
  const timeout = setTimeout(async () => {
    await page.close();
    console.log(
      `ERROR: hover test on sample of ${sample.length} triggers timed out at ${timeLimit} seconds; page closed`
    );
    data.prevented = true;
    data.error = 'ERROR: hover test timed out';
    clearTimeout(timeout);
  }, 1000 * timeLimit);
  // For each trigger in the sample:
  let successCount = 0;
  for (const loc of sample) {
    // Hover over it and get the fractional pixel change.
    const hoverData = await visChange(page, {
      delayBefore: 0,
      delayBetween: 500,
      exclusion: loc
    });
    // If the hovering and measurement succeeded:
    if (hoverData.success) {
      successCount++;
      // If any pixels changed:
      if (hoverData.pixelChanges) {
        // Get the ordinal severity from the fractional pixel change.
        const ordinalSeverity = Math.floor(Math.min(3, 0.4 * Math.sqrt(data.changePercent)));
        // Add to the totals.
        totals[ordinalSeverity] += psRatio;
        // If itemization is required:
        if (withItems) {
          // Get data on the trigger.
          const elData = await getLocatorData(loc);
          // Add an instance to the result.
          standardInstances.push({
            ruleID: 'hover',
            what: 'Hovering over the element changes the page',
            ordinalSeverity,
            tagName: elData.tagName,
            id: elData.id,
            location: elData.location,
            excerpt: elData.excerpt
          });
        }
      }
    }
    // Otherwise, if hovering and measurement failed after at least 1 success:
    else if (successCount) {
      // Revise the totals accordingly.
      totals.forEach((total, index) => {
        totals[index] *= sample.length / successCount;
      });
      // Stop processing the sample.
      break;
    }
    // Otherwise, i.e. if hovering and measurement failed on the first case:
    else {
      // Report this.
      data.prevented = true;
      data.error = `ERROR: Hovering and impact measurement failed after trial ${successCount}`;
      break;
    }
  }
  // If itemization is not required:
  if (! withItems) {
    // For each ordinal severity:
    for (const index in totals) {
      // If there were any instances with it:
      if (totals[index]) {
        // Add a summary instance to the result.
        standardInstances.push({
          ruleID: 'hover',
          what: 'Hovering over elements changes the page',
          ordinalSeverity: index,
          count: Math.round(totals[index]),
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
    }
  }
  // Round the totals.
  totals.forEach((total, index) => {
    totals[index] = Math.round(totals[index]);
  });
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
