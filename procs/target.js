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
  // If the target is an inline link:
  if (await isInlineLink(loc)) {
    // Exempt it.
    sizeData = null;
  }
  // Otherwise, i.e. if it is not an inline link:
  else {
    // Get data on it if it is too small.
    let sizeData = await loc.evaluate((el, min) => {
      // Gets the width and height of an element.
      const getDims = el => {
        const rect = el.getBoundingClientRect();
        const widthR = rect && rect.width || 0;
        const heightR = rect && rect.height || 0;
        const widthP = el.offsetWidth || 0;
        const width = Math.max(widthP, Math.round(widthR));
        const heightP = el.offsetHeight || 0;
        const height = Math.max(heightP, Math.round(heightR));
        return [width, height];
      };
      const tagName = el.tagName;
      // Get the width and height of the target.
      const elDims = getDims(el);
      // If either dimension is too small:
      if (elDims.some(dim => dim < min)) {
        // Get the parent of the target.
        const elParent = el.parentElement;
        // Get the child elements of the parent, including the target.
        const elGeneration = Array.from(elParent.children);
        // If the target has no siblings of its type:
        if (elGeneration.filter(peer => peer.tagName === tagName).length === 1) {
          // Get the width and height of the parent.
          const parentDims = getDims(el);
          elDims.forEach((elDim, index) => {
            if (elDim < min && parentDims[index] > elDim) {
              elDims[index] = parentDims[index];
            }
          });
      const rect = el.getBoundingClientRect();
      const widthR = rect && rect.width || 0;
      const heightR = rect && rect.height || 0;
      const widthP = el.offsetWidth;
      const width = Math.max(widthP, Math.round(widthR));
      const heightP = el.offsetHeight;
      const height = Math.max(heightP, Math.round(heightR));
      // Get whether either is too small.
      const isSmall = width < min || height < min;
      const styleDec = window.getComputedStyle(el);
      const displayStyle = styleDec.display;
      // If the element is hidden:
      if (displayStyle === 'none') {
        // Exempt it.
        return null;
      }
      // Otherwise, i.e. if it is displayed:
      else {
        // Get its data if too small or its compliant status.
        return isSmall ? {tagName, width, height} : null;
      }
  }, min);
  // If it is too small and displayed:
  if (sizeData) {
  }
  // Return data about the target or its compliant status.
  return sizeData;
};
