/*
  © 2023 CVS Health and/or one of its affiliates. All rights reserved.

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
  getLocatorData
  Returns data about the element identified by a locator.
*/
exports.getLocatorData = async loc => {
  const locCount = await loc.count();
  // If the locator identifies exactly 1 element:
  if (locCount === 1) {
    // Get the facts obtainable from the browser.
    const data = await loc.evaluate(element => {
      // Tag name.
      const tagName = element.tagName;
      // ID.
      const id = element.id || '';
      // Texts.
      const {textContent} = element;
      const alts = Array.from(element.querySelectorAll('img[alt]:not([alt=""])'));
      const altTexts = alts.map(alt => alt.getAttribute('alt'));
      const altsText = altTexts.join(' ');
      const ariaLabelText = element.ariaLabel || '';
      const refLabelID = element.getAttribute('aria-labelledby');
      const refLabel = refLabelID ? document.getElementById(refLabelID) : '';
      const refLabelText = refLabel ? refLabel.textContent : '';
      let labelsText = '';
      if (tagName === 'INPUT') {
        const labels = element.labels || [];
        const labelTexts = [];
        labels.forEach(label => {
          labelTexts.push(label.textContent);
        });
        labelsText = labelTexts.join(' ');
      }
      let text = [textContent, altsText, ariaLabelText, refLabelText, labelsText]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
      if (! text) {
        text = element.outerHTML.replace(/\s+/g, ' ').trim();
      }
      if (/^<[^<>]+>$/.test(text)) {
        text = element.parentElement.outerHTML.replace(/\s+/g, ' ').trim();
      }
      // Location.
      let location = {
        doc: 'dom',
        type: 'box',
        spec: {}
      };
      if (id) {
        location.type = 'selector';
        location.spec = `#${id}`;
      }
      // Return the data.
      return {
        tagName,
        id,
        location,
        excerpt: text
      };
    });
    // If an ID-based selector could not be defined:
    if (data.location.type === 'box') {
      // Define a bounding-box-based location.
      const rawSpec = await loc.boundingBox();
      // If there is a bounding box:
      if (rawSpec) {
        // Populate the location.
        Object.keys(rawSpec).forEach(specName => {
          data.location.spec[specName] = Math.round(rawSpec[specName]);
        });
      }
      // Otherwise, i.e. if there is no bounding box:
      else {
        // Empty the location.
        data.location.doc = '';
        data.location.type = '';
        data.location.spec = '';
      }
    }
    // If the text is long:
    if (data.excerpt.length > 400) {
      // Truncate its middle.
      data.excerpt = `${data.excerpt.slice(0, 200)} … ${data.excerpt.slice(-200)}`;
    }
    // Return the data.
    return data;
  }
  // Otherwise, i.e. if it does not identify exactly 1 element:
  else {
    // Report this.
    console.log(`ERROR: Locator count to get data from is ${locCount} instead of 1`);
    return null;
  }
};
