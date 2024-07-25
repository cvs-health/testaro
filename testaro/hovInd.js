/*
  © 2023 CVS Health and/or one of its affiliates. All rights reserved.

  MIT License

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  hovInd
  This test reports nonstandard hover indication.
  */

// IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');
// Module to draw a sample.
const {getSample} = require('../procs/sample');

// CONSTANTS

// Standard non-default hover cursors
const standardCursor = {
  A: 'pointer',
  INPUT: {
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
    inputType: element.tagName === 'INPUT' ? element.getAttribute('type') || 'text' : null,
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
  // If the element is an input or a link:
  if (standardCursor[tagName]) {
    // If it is an input:
    if (tagName === 'INPUT') {
      // Get whether its hover cursor is standard.
      data.ok = [standardCursor.INPUT[hovStyles.inputType], 'default', 'auto'].includes(cursor);
    }
    // Otherwise, i.e. if it is a link:
    else {
      // Get whether its hover cursor is standard.
      data.ok = [standardCursor.A, 'auto'].includes(cursor);
    }
  }
  // Otherwise, if it is a button:
  else if (tagName === 'BUTTON') {
    // Get whether its hover cursor is standard.
    data.ok = ['default', 'auto'].includes(cursor);
  }
  // Otherwise, i.e. if it has another type and a hover listener:
  else {
    // Assume its hover cursor is standard.
    data.ok = true;
  }
  return data;
};
// Returns whether two hover styles are effectively identical.
const areAlike = (styles0, styles1) => {
  // Return whether they are effectively identical.
  const areAlike = ['outline', 'border', 'backgroundColor']
  .every(style => styles1[style] === styles0[style]);
  return areAlike;
};
// Performs the hovInd test and reports results.
exports.reporter = async (page, withItems, sampleSize = 20) => {
  // Initialize the result.
  const data = {
    typeTotals: {
      badCursor: 0,
      hoverLikeDefault: 0,
      hoverLikeFocus: 0
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
    // Try to focus it.
    try {
      await loc.focus({timeout: 500});
      // If focusing succeeds, get its style properties.
      const focStyles = await getHoverStyles(loc);
      // Try to hover over it.
      try {
        await loc.hover({timeout: 500});
        // If hovering succeeds, get its style properties.
        const fhStyles = await getHoverStyles(loc);
        // Try to blur it.
        try {
          await loc.blur({timeout: 500});
          // If blurring succeeds, get its style properties.
          const hovStyles = await getHoverStyles(loc);
          // If all 4 style declarations belong to the same element:
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
            // If the hover and focus-hover states are indistinct but differ from the default state:
            if (areAlike(hovStyles, focStyles) && ! areAlike(hovStyles, preStyles)) {
              // Add to the totals.
              totals[1] += psRatio;
              data.typeTotals.hoverLikeFocus += psRatio;
              // If itemization is required:
              if (withItems) {
                // Add an instance to the result.
                standardInstances.push({
                  ruleID: 'hovInd',
                  what: 'Element border, outline, and background color are alike on hover and focus',
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
            // Report this and quit.
            data.prevented = true;
            data.error = 'ERROR: Page changes on focus or hover prevent test';
            break;
          }
        }
        // If blurring fails:
        catch(error) {
          // Report this.
          data.prevented = true;
          data.error = 'ERROR: Page changes on focus or hover prevent test';
          break;
        }
      }
      // If hovering fails:
      catch(error) {
        // Report this.
        data.prevented = true;
        data.error = 'ERROR: Page changes on focus or hover prevent test';
        break;
      }
    }
    // If focusing fails:
    catch(error) {
      // Report this.
      data.prevented = true;
      data.error = 'ERROR: Page changes on focus or hover prevent test';
      break;
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
