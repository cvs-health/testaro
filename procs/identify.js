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

// Returns the bounding box of a locator.
const boxOf = async locator => {
  try {
    const box = await locator.boundingBox({
      timeout: 50
    });
    if (box) {
      Object.keys(box).forEach(dim => {
        box[dim] = Math.round(box[dim], 0);
      });
      console.log('Got box');
      return box;
    }
    else {
      console.log('No bounding box');
      return null;
    }
  }
  catch(error) {
    console.log(`ERROR getting box (${error.message})`);
    return null;
  }
}
// Returns a string representation of a bounding box.
const boxToString = box => {
  if (box) {
    return ['x', 'y', 'width', 'height'].map(dim => box[dim]).join(':');
  }
  else {
    return '';
  }
};
// Returns the bounding box of the element of a standard instance.
exports.identify = async (instance, page) => {
  const {tagName, location, excerpt} = instance;
  // If the instance specifies a bounding box:
  if (location.type === 'box') {
    // Return it.
    return boxToString(location.spec);
  }
  // Otherwise, if the instance specifies a selector location:
  else if (location.type === 'selector') {
    // Return the bounding box of the first element matching it.
    const locator = page.locator(location.spec).first();
    const box = await boxOf(locator);
    return boxToString(box);
  }
  // Otherwise, if the instance specifies an XPath location:
  else if (location.type === 'xpath') {
    // Remove any final text function.
    const elPath = location.spec.replace(/\/text\(\)\[\d+\]$/, '');
    // Return the bounding box of the first element matching the path.
    const locator = page.locator(`xpath=${elPath}`).first();
    const box = await boxOf(locator);
    return boxToString(box);
  }
  // Otherwise, if the instance specifies both a tag name and an excerpt:
  else if (tagName && excerpt) {
    // Get the plain text parts of the excerpt, converting ... to an empty string.
    console.log(`excerpt: ${excerpt}`);
    const minTagExcerpt = excerpt.replace(/<[^>]+>/g, '<>');
    console.log(`minTagExcerpt: ${minTagExcerpt}`);
    const plainParts = (minTagExcerpt.match(/[^<>]+/g) || [])
    .map(part => part === '...' ? '' : part);
    console.log(`plainParts length: ${plainParts.length}`);
    console.log(`plainParts: ((${plainParts}))`);
    // Get the longest of them.
    const sortedPlainParts = plainParts.sort((a, b) => b.length - a.length);
    console.log(`sortedPlainParts: ((${sortedPlainParts}))`);
    const mainPart = sortedPlainParts.length ? sortedPlainParts[0] : '';
    console.log(`mainPart: ((${mainPart}))`);
    const compactMainPart = mainPart.trim().replace(/\s{2,}/g, ' ');
    // Get locators for matching elements.
    const locators = page.locator(tagName.toLowerCase(), {hasText: compactMainPart});
    console.log(`tag name: ${tagName.toLowerCase()}`);
    console.log(`compactMainPart: ${compactMainPart}`);
    // If there is exactly 1 of them:
    const locatorCount = await locators.count();
    console.log(`Tag name and excerpt match count: ${locatorCount}`);
    if (locatorCount === 1) {
      // Return the bounding box of its element.
      const box = await boxOf(locators);
      console.log(`box: ${JSON.stringify(box, null, 2)}`);
      return boxToString(box);
    }
  }
  // Otherwise, i.e. if the instance does not permit bounding-box identification:
  else {
    // Return this.
    return '';
  }
};
