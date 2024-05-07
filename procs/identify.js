/*
  © 2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  identify.js
  Identifies the element of a standard instance.
*/

// IMPORTS

// Module to get the XPath of an element.
const {xPath} = require('playwright-dompath');

// FUNCTIONS

// Returns the bounding box of a locator.
const boxOf = exports.boxOf = async locator => {
  try {
    const isVisible = await locator.isVisible();
    if (isVisible) {
      const box = await locator.boundingBox({
        timeout: 50
      });
      if (box) {
        Object.keys(box).forEach(dim => {
          box[dim] = Math.round(box[dim], 0);
        });
        return box;
      }
      else {
        return null;
      }
    }
    else {
      return null;
    }
  }
  catch(error) {
    return null;
  }
}
// Returns a string representation of a bounding box.
const boxToString = exports.boxToString = box => {
  if (box) {
    return ['x', 'y', 'width', 'height'].map(dim => box[dim]).join(':');
  }
  else {
    return '';
  }
};
// Adds a box ID and a path ID to an object.
const addIDs = async (locators, recipient) => {
  // If there is exactly 1 of them:
  const locatorCount = await locators.count();
  if (locatorCount === 1) {
    // Add the box ID of the element to the result if none exists yet.
    if (! recipient.boxID) {
      const box = await boxOf(locators);
      recipient.boxID = boxToString(box);
    }
    // Add the path ID of the element to the result if none exists yet.
    if (! recipient.pathID) {
      recipient.pathID = await xPath(locators);
    }
  }
};
// Returns the XPath and box ID of the element of a standard instance.
exports.identify = async (instance, page) => {
  // If the instance does not yet have both boxID and pathID properties:
  if (['boxID', 'pathID'].some(key => instance[key] === undefined)) {
    // Initialize a result.
    const elementID = {
      boxID: '',
      pathID: ''
    };
    const {excerpt, id, location, tagName} = instance;
    const {type, spec} = location;
    // If the instance specifies a CSS selector or XPath location:
    if (['selector', 'xpath'].includes(type)) {
      // Get a locator of the element.
      let specifier = spec;
      if (type === 'xpath') {
        specifier = spec.replace(/\/text\(\)\[\d+\]$/, '');
      }
      if (specifier) {
        if (type === 'xpath') {
          specifier = `xpath=${specifier}`;
        }
        try {
          const locators = page.locator(specifier);
          const locatorCount = await locators.count();
          // If the count of matching elements is 1:
          if (locatorCount === 1) {
            // Add a box ID and a path ID to the result.
            await addIDs(locators, elementID);
          }
          // Otherwise, if the count is not 1 and the instance specifies an XPath location:
          else if (type === 'xpath') {
            // Use the XPath location as the path ID.
            elementID.pathID = spec;
          }
        }
        catch(error) {
          console.log(`ERROR locating element by CSS selector or XPath (${error.message})`);
        }
      }
    }
    // If either ID remains undefined and the instance specifies an element ID:
    if (id && ! (elementID.boxID && elementID.pathID)) {
      // Get the first of the locators for elements with the ID.
      try {
        let locator = page.locator(`#${id.replace(/([-&;/]|^\d)/g, '\\$1')}`).first();
        // Add a box ID and a path ID to the result.
        await addIDs(locator, elementID);
      }
      catch(error) {
        console.log(`ERROR locating element by ID (${error.message})`);
      }
    }
    // If either ID remains undefined and the instance specifies a tag name:
    if (tagName && ! (elementID.boxID && elementID.pathID)) {
      // Get locators for elements with the tag name.
      let locators = page.locator(tagName.toLowerCase());
      // If there is exactly 1 of them:
      let locatorCount = await locators.count();
      if (locatorCount === 1) {
        // Add a box ID and a path ID to the result.
        await addIDs(locators, elementID);
      }
      // If either ID remains undefined an the instance also specifies an excerpt:
      if (excerpt && ! (elementID.boxID && elementID.pathID)) {
        // Get the plain text parts of the excerpt, converting ... to an empty string.
        const minTagExcerpt = excerpt.replace(/<[^>]+>/g, '<>');
        const plainParts = (minTagExcerpt.match(/[^<>]+/g) || [])
        .map(part => part === '...' ? '' : part);
        // Get the longest of them.
        const sortedPlainParts = plainParts.sort((a, b) => b.length - a.length);
        const mainPart = sortedPlainParts.length ? sortedPlainParts[0] : '';
        // If there is one:
        if (mainPart.trim().replace(/\s+/g, '').length) {
          // Get locators for elements with the tag name and the text.
          const locators = page.locator(tagName.toLowerCase(), {hasText: mainPart});
          // If there is exactly 1 of them:
          const locatorCount = await locators.count();
          if (locatorCount === 1) {
            // Add a box ID and a path ID to the result.
            await addIDs(locators, elementID);
          }
        }
      }
    }
    // Return the result (not yet getting IDs from Nu Html Checker lines and columns).
    return elementID;
  }
};
