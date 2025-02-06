/*
  © 2023–2025 CVS Health and/or one of its affiliates. All rights reserved.

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
  targetSmall
  Related to Tenon rule 152, but stricter.
  This test reports buttons, inputs, and non-inline links with widths or heights smaller than 44 pixels.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');
// Module to classify links.
const {isInlineLink} = require('../procs/isInlineLink');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(100, page, 'a, button, input');
  // For each locator:
  for (const loc of all.allLocs) {
    // Get the size of its element, if small.
    const sizeData = await loc.evaluate(el => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const tagName = el.tagName;
      return width < 44 || height < 44 ? {tagName, width, height} : null;
    });
    // If it is small:
    if (sizeData) {
      // Get whether it violates the rule.
      let isBad = true;
      if (sizeData.tagName === 'A') {
        isBad = await isInlineLink(loc);
      }
      // If it does:
      if (isBad) {
        // Add the locator to the array of violators.
        all.locs.push([loc, `${sizeData.width} wide by ${sizeData.height} high`]);
      }
    }
  }
  // Populate and return the result.
  const whats = [
    'Interactive element pixel size (__param__) is less than 44 by 44',
    'Interactive elements are smaller than 44 pixels wide and high'
  ];
  return await report(withItems, all, 'targetSmall', whats, 1);
};
