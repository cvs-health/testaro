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

  Pixel changes: If no pixel changes occur immediately after an element is hovered over, the page
  is examined once more, after 0.5 second. The greater the fraction of changed pixels, the greater
  the ordinal severity.

  Unhoverability: An element is reported as unhoverable when it fails the Playwright actionability
  checks for hovering, i.e. fails to be attached to the DOM, visible, stable (not or no longer
  animating), and able to receive events. All triggers satisfy the first two conditions, so only the
  last two might fail. Playwright defines the ability to receive events as being the target of an
  action on the location where the center of the element is, rather than some other element with a
  higher zIndex value in the same location being the target.

  WARNING: This test uses the procs/visChange module. See the warning in that module about browser
  types.
*/

// IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');
// Module to draw a sample.
const {getSample} = require('../procs/sample');
// Module to get pixel changes between two times.
const {visChange} = require('../procs/visChange');

// FUNCTIONS

// Performs the hover test and reports results.
exports.reporter = async (page, withItems, sampleSize = 20) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Identify the triggers.
  const selectors = ['a', 'button', 'li:not([role=menuitem])', '[onmouseenter]', '[onmouseover]'];
  const selectorString = selectors.map(selector => `body ${selector}:visible`).join(', ');
  const locAll = page.locator(selectorString);
  const locsAll = await locAll.all();
  // Get the population-to-sample ratio.
  const psRatio = Math.max(1, locsAll.length / sampleSize);
  // Get a sample of the triggers.
  const sampleIndexes = getSample(locsAll, sampleSize);
  const sample = sampleIndexes.map(index => locsAll[index]);
  // For each trigger in the sample:
  for (const loc of sample) {
    // Hover over it and get the fractional pixel change.
    const hoverData = await visChange(page, {
      delayBefore: 0,
      delayBetween: 500,
      exclusion: loc
    });
    // If the hovering and measurement succeeded:
    if (hoverData.success) {
      // If any pixels changed:
      if (hoverData.changePercent) {
        // Get the ordinal severity from the fractional pixel change.
        const ordinalSeverity = Math.floor(Math.min(3, 0.4 * Math.sqrt(hoverData.changePercent)));
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
    // Otherwise, i.e. if hovering and measurement failed:
    else {
      // Add to the totals.
      totals[3] += psRatio;
      // If itemization is required:
      if (withItems) {
        // Get data on the trigger.
        const elData = await getLocatorData(loc);
        // Add an instance to the result.
        standardInstances.push({
          ruleID: 'hover',
          what: 'Element is not hoverable',
          ordinalSeverity: 3,
          tagName: elData.tagName,
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
    // Reload the page to preserve locator integrity.
    try {
      await page.reload({timeout: 5000});
    }
    catch(error) {
      console.log('ERROR: page reload timed out');
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
          what: 'Hovering over elements changes the page or fails',
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
  // Return the result.
  return {
    data,
    totals,
    standardInstances
  };
};
