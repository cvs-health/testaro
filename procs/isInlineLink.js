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
  isInlineLink
  Returns whether the link of a locator is inline.
  A link is classified as inline unless it is in an ordered or unordered list of at least 2 links
  with no other nonspacing text content.
*/

exports.isInlineLink = async loc => await loc.evaluate(element => {
  // If the element is not a link:
  if (element.tagName !== 'A' && element.getAttribute('role') !== 'link') {
    // Classify it as not an inline link.
    return false;
  }
  // Otherwise, i.e. if it is a link:
  else {
    let listAncestor;
    // Initialize the link as inline.
    let result = true;
    // If its display style property is block:
    const styleDec = window.getComputedStyle(element);
    if (styleDec.display === 'block') {
      // Reclassify the link as non-inline.
      result = false;
    }
    // Otherwise, if it is in a list item in a list of at least 2 links:
    else if (listAncestor = element.closest('ul, ol')) {
      if (listAncestor.children.length > 1 && Array.from(listAncestor.children).every(child => {
        const isValidListItem = child.tagName === 'LI';
        const has1Link = child.querySelectorAll('a').length === 1;
        return isValidListItem && has1Link;
      })) {
        // If the list text is entirely link text:
        const listText = listAncestor.textContent.replace(/\s/g, '');
        let linkTextRaw = '';
        listAncestor.querySelectorAll('a').forEach(link => {
          linkTextRaw += link.textContent;
        });
        const linkText = linkTextRaw.replace(/\s/g, '');
        console.log(linkText);
        if (listText === linkText && listText.length) {
          // Reclassify the link as non-inline.
          result = false;
        }
      }
    }
    // Return the result.
    return result;
  }
});
