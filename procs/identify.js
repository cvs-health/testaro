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

// ########## FUNCTIONS

// Returns a string representation of a bounding box.
const boxToString = box => ['x', 'y', 'width', 'height'].map(dim => box[dim]).join(':');
// Returns the bounding box of the element of a standard instance.
exports.identify = async (instance, page) => {
  const {tagName, id, location, excerpt} = instance;
  // If the instance specifies a bounding box:
  if (location.type === 'box') {
    // Return it.
    return boxToString(location.spec);
  }
  // Otherwise, if the instance specifies an ID:
  else if (id) {
    // Return the bounding box of the element.
    const locator = page.locator(`#${id}`);
    const box = await locator.boundingBox();
    return boxToString(box);
  }
  // Otherwise, if the instance specifies a selector location:
  else if (location.type === 'selector') {
    // Return the bounding box of the element.
    const locator = page.locator(location.spec);
    const box = await locator.boundingBox();
    return boxToString(box);
  }
  // Otherwise, if the instance specifies an XPath location:
  else if (location.type === 'xpath') {
    // Return the bounding box of the element.
    const locator = page.locator(`xpath=/${location.spec}`);
    const box = await locator.boundingBox();
    return boxToString(box);
  }
  // Otherwise, if the instance specifies both a tag name and an excerpt:
  else if (tagName && excerpt) {
    // Get the plain text parts of the excerpt.
    const minTagExcerpt = excerpt.replace(/<[^>]+>/g, '<>');
    const plainParts = minTagExcerpt.match(/[<>]+/g);
    // Get the longest of them.
    const mainPart = plainParts.sort((a, b) => b.length - a.length)[0];
    // Get locators for matching elements.
    const locators = page.locator(tagName.toLowerCase(), {hasText: mainPart});
    // If there is exactly 1 of them:
    if (locators.count === 1) {
      // Return the bounding box of its element.
      box = await locators.boundingBox();
      return boxToString(box);
    }
  }
  // Otherwise, i.e. if the instance does not permit bounding-box identification:
  else {
    // Return this.
    return '';
  }
};
