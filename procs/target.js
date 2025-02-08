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
  target
  Utilities for Testaro targetSmall and targetTiny tests.
*/

// ########## IMPORTS

// Module to classify links.
const {isInlineLink} = require('./isInlineLink');

// ########## FUNCTIONS

// Returns data about a target if it is illicitly small.
exports.isTooSmall = async (loc, min) => {
  const sizeData = await loc.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const widthR = rect && rect.width || 0;
    const heightR = rect && rect.height || 0;
    const widthP = el.offsetWidth;
    const width = Math.max(widthP, Math.round(widthR));
    const heightP = el.offsetHeight;
    const height = Math.max(heightP, Math.round(heightR));
    const tagName = el.tagName;
    const isSmall = width < min || height < min;
    const styleDec = window.getComputedStyle(el);
    const displayStyle = styleDec.display;
    if (displayStyle === 'none') {
      return null;
    }
    else {
      return isSmall ? {tagName, width, height} : null;
    }
  });
  // If it is too small and displayed:
  if (sizeData) {
    // If it is an inline link:
    if (sizeData.tagName === 'A' && await isInlineLink(loc)) {
      // Exempt it.
      sizeData = null;
    }
  }
  // Return data about the target or that it is not illicitly too small.
  return sizeData;
};
