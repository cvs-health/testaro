/*
  © 2022–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  focVis
  Derived from the bbc-a11y elementsMustBeVisibleOnFocus test.
  This test reports links that are off the display when focused.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(100, page, 'a:visible');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get how its element violates the rule, if it does.
    try {
      const isBad = await loc.evaluate(el => {
        const isAbove = el.offsetTop + el.offsetHeight <= 0;
        const isLeft = el.offsetLeft + el.offsetWidth <= 0;
        return [isAbove, isLeft];
      }, {timeout: 500});
      // If it does:
      if (isBad[0] || isBad[1]) {
        // Add the locator to the array of violators.
        let param;
        if (isBad[0] && isBad[1]) {
          param = 'above and to the left of';
        }
        else if (isBad[0]) {
          param = 'above';
        }
        else {
          param = 'to the left of';
        }
        all.locs.push([loc, param]);
      }
    }
    catch(error) {
      console.log(`ERROR analyzing locator for focVis (${error.message})`);
    }
  }
  // Populate and return the result.
  const whats = [
    'Visible link is __param__ the display',
    'Visible links are above or to the left of the display'
  ];
  return await report(withItems, all, 'focVis', whats, 2);
};
