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

  WARNING: This test uses the Playwright page.screenshot method, which is not implemented for the
  firefox browser type.
*/

// IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// CONSTANTS

// Standard non-default hover cursors
const standardCursor = {
  A: 'pointer',
  INPUT: {
    '': 'text',
    email: 'text',
    image: 'pointer',
    number: 'text',
    password: 'text',
    search: 'text',
    tel: 'text',
    text: 'text',
    url: 'text'
  }
};

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
// Returns the hover-related style properties of a trigger.
const getHoverStyles = async loc => await loc.evaluate(element => {
  const {
    cursor,
    borderColor,
    borderStyle,
    borderWidth,
    outlineColor,
    outlineStyle,
    outlineWidth,
    outlineOffset,
    backgroundColor
  } = window.getComputedStyle(element);
  return {
    tagName: element.tagName,
    inputType: element.tagName === 'INPUT' ? element.getAttribute('type') : null,
    cursor: cursor.replace(/^.+, */, ''),
    border: `${borderColor} ${borderStyle} ${borderWidth}`,
    outline: `${outlineColor} ${outlineStyle} ${outlineWidth} ${outlineOffset}`,
    backgroundColor
  };
});
// Returns data on the hover cursor.
const getCursorData = hovStyles => {
  const {cursor, tagName} = hovStyles;
  const data = {
    cursor
  };
  if (standardCursor[tagName]) {
    if (tagName === 'INPUT') {
      data.ok = cursor === (standardCursor.INPUT[hovStyles.inputType] || 'default');
    }
    else {
      data.ok = cursor === 'pointer';
    }
  }
  else {
    data.ok = cursor === 'default';
  }
};
// Returns whether two hover styles are effectively identical.
const areAlike = (styles0, styles1) => ['outline', 'border', 'backgroundColor']
.every(style => styles1[style] === styles0[style]);
// Performs the hovInd test and reports results.
exports.reporter = async (page, withItems, sampleSize = 20) => {
  // Initialize the result.
  const data = {
    typeTotals: {
      badCursor: 0,
      hoverLikeDefault: 0,
      fhLikeFocus: 0
    }
  };
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Identify the triggers.
  const selectors = ['a', 'button', 'input', '[onmouseenter]', '[onmouseover]'];
  const selectorString = selectors.map(selector => `body ${selector}:visible`).join(', ');
  const locAll = page.locator(selectorString);
  const locsAll = await locAll.all();
  // Get the population-to-sample ratio.
  const psRatio = Math.max(1, locsAll.length / sampleSize);
  // Get a sample of the triggers.
  const sampleIndexes = getSample(locsAll, sampleSize);
  const sample = locsAll.filter((loc, index) => sampleIndexes.includes(index));
  // For each trigger in the sample:
  for (const loc of sample) {
    // Get its style properties.
    const preStyles = await getHoverStyles(loc);
    // Focus it.
    await loc.focus();
    // Get its style properties.
    const focStyles = await getHoverStyles(loc);
    // Hover over it.
    await loc.hover();
    // Get its style properties.
    const fhStyles = await getHoverStyles(loc);
    // Blur it.
    await page.focus({
      location: {
        x: 0,
        y: 0
      }
    });
    // Get its style properties.
    const hovStyles = await getHoverStyles(loc);
    // If the style properties belong to the same element:
    if ([focStyles, fhStyles, hovStyles].every(style => style.code === preStyles.code)) {
      // Get data on the element if itemization is required.
      const elData = withItems ? await getLocatorData(loc) : null;
      // If the hover cursor is nonstandard:
      const cursorData = getCursorData(hovStyles);
      if (! cursorData.ok) {
        // Add to the totals.
        totals[2] += psRatio;
        data.typeTotals.badCursor += psRatio;
        // If itemization is required:
        if (withItems) {
          // Add an instance to the result.
          standardInstances.push({
            ruleID: 'hovInd',
            what: `Element has a nonstandard hover cursor (${cursorData.cursor})`,
            ordinalSeverity: 2,
            tagName: elData.tagName,
            id: elData.id,
            location: elData.location,
            excerpt: elData.excerpt
          });
        }
      }
      // If the element is a button and the hover and default states are not distinct:
      if (hovStyles.tagName === 'BUTTON' && areAlike(preStyles, hovStyles)) {
        // Add to the totals.
        totals[1] += psRatio;
        data.typeTotals.hoverLikeDefault += psRatio;
        // If itemization is required:
        if (withItems) {
          // Add an instance to the result.
          standardInstances.push({
            ruleID: 'hovInd',
            what: 'Element border, outline, and background color do not change when hovered over',
            ordinalSeverity: 1,
            tagName: elData.tagName,
            id: elData.id,
            location: elData.location,
            excerpt: elData.excerpt
          });
        }
      }
      // If the hover and focus-hover states are not distinct:
      if (areAlike(hovStyles, fhStyles)) {
        // Add to the totals.
        totals[1] += psRatio;
        data.typeTotals.fhLikeFocus += psRatio;
        // If itemization is required:
        if (withItems) {
          // Add an instance to the result.
          standardInstances.push({
            ruleID: 'hovInd',
            what: 'Element border, outline, and background color on focus do not change when also hovered over',
            ordinalSeverity: 1,
            tagName: elData.tagName,
            id: elData.id,
            location: elData.location,
            excerpt: elData.excerpt
          });
        }
      }
    }
    // Otherwise, i.e. if the style properties do not all belong to the same element:
    else {
      // Report this.
      data.prevented = true;
      data.error = 'ERROR: Page changes on focus or hover prevent test';
    }
  }
  // Round the totals.
  Object.keys(data.typeTotals).forEach(rule => {
    data.typeTotals[rule] = Math.round(data.typeTotals[rule]);
  });
  for (const index in totals) {
    totals[index] = Math.round(totals[index]);
  }
  // If itemization is not required:
  if (! withItems) {
    // If any triggers have nonstandard hover cursors:
    if (data.typeTotals.badCursor) {
      // Add a summary instance to the result.
      standardInstances.push({
        ruleID: 'hovInd',
        what: 'Elements have nonstandard hover cursors',
        ordinalSeverity: 2,
        count: data.typeTotals.badCursor,
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
    // If any triggers have hover styles not distinct from their default styles:
    if (data.typeTotals.hoverLikeDefault) {
      // Add a summary instance to the result.
      standardInstances.push({
        ruleID: 'hovInd',
        what: 'Element borders, outlines, and background colors do not change when hovered over',
        ordinalSeverity: 1,
        count: data.typeTotals.hoverLikeDefault,
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
    // If any triggers have focus-hover styles not distinct from their focus styles:
    if (data.typeTotals.fhLikeFocus) {
      // Add a summary instance to the result.
      standardInstances.push({
        ruleID: 'hovInd',
        what: 'Element borders, outlines, and background colors on focus do not change when also hovered over',
        ordinalSeverity: 1,
        count: data.typeTotals.fhLikeFocus,
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
  // Return the result.
  return {
    data,
    totals,
    standardInstances
  };
};
