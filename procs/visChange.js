/*
  © 2023–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  visChange
  This procedure reports a change in the visible content of a page between two times, optionally
  hovering over a locator-defined element immediately after the first time.

  WARNING: This test uses the Playwright page.screenshot method, which produces incorrect results
  when the browser type is chromium and is not implemented for the firefox browser type. The only
  browser type usable with this test is webkit.
*/

// IMPORTS

const {PNG} = require('pngjs');

// FUNCTIONS

// Creates and returns a screenshot.
const shoot = async (page, exclusion = null) => {
  // Make a screenshot as a buffer.
  const options = {
    fullPage: true,
    omitBackground: true,
    timeout: 2000
  };
  if (exclusion) {
    options.mask = [exclusion];
  }
  return await page.screenshot(options)
  .catch(error => {
    console.log(`ERROR: Screenshot failed (${error.message})`);
    return '';
  });
};
exports.visChange = async (page, options = {}) => {
  const {delayBefore, delayBetween, exclusion} = options;
  // Wait, if required.
  if (delayBefore) {
    await page.waitForTimeout(delayBefore);
  }
  // If an exclusion was specified:
  if (exclusion) {
    // Hover over the upper-left corner of the page for test isolation.
    const docLoc = page.locator('html');
    await docLoc.hover({
      position: {
        x: 0,
        y: 0
      }
    });
  }
  // Make and get a screenshot, excluding an element if specified.
  const shot0 = await shoot(page, exclusion);
  // If it succeeded:
  if (shot0.length) {
    // If an exclusion was specified:
    if (exclusion) {
      // Hover over it.
      try {
        await exclusion.hover({
          timeout: 500,
          noWaitAfter: true
        });
      }
      catch(error) {
        return {
          success: false,
          error: 'Hovering failed'
        };
      }
    }
    // Wait as specified, or 3 seconds.
    await page.waitForTimeout(delayBetween || 3000);
    // Make and get another screenshot.
    const shot1 = await shoot(page, exclusion);
    // If it succeeded:
    if (shot1.length) {
      // Get the shots as PNG images.
      const pngs = [shot0, shot1].map(shot => PNG.sync.read(shot));
      // Get their dimensions.
      const {width, height} = pngs[0];
      // Get the count of differing pixels between the shots.
      const pixelmatchModule = await import('pixelmatch');
      const pixelmatch = pixelmatchModule.default;
      const pixelChanges = pixelmatch(pngs[0].data, pngs[1].data, null, width, height);
      // Get the ratio of differing to all pixels as a percentage.
      const changePercent = 100 * pixelChanges / (width * height);
      // Return this.
      return {
        success: true,
        width,
        height,
        pixelChanges,
        changePercent
      };
    }
    // Otherwise, i.e. if the second screenshot failed:
    else {
      // Return this.
      return {
        success: false,
        prevented: true,
        error: 'Second screenshot failed'
      };
    }
  }
  // Otherwise, i.e. if the first screenshot failed:
  else {
    // Return this.
    return {
      success: false,
      prevented: true,
      error: 'First screenshot failed'
    };
  }
};
