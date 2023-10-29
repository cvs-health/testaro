/*
  © 2022–2023 CVS Health and/or one of its affiliates. All rights reserved.

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
  docType
  Derived from the bbc-a11y allDocumentsMustHaveAW3cRecommendedDoctype test.
  This test reports a failure to equip the page document with a W3C-recommended HTML doctype.
*/
exports.reporter = async page => {
  // Identify the visible links without href attributes.
  const docHasType = await page.evaluate(() => {
    const docType = document.doctype;
    const docHasType = !! docType && docType.name && docType.name.toLowerCase() === 'html';
    return docHasType;
  });
  return {
    data: {docHasType},
    totals: [0, 0, 0, docHasType ? 0 : 1],
    standardInstances: docHasType ? [] : [{
      ruleID: 'docType',
      what: 'Document has no standard HTML doctype preamble',
      ordinalSeverity: 3,
      tagName: 'HTML',
      id: '',
      location: {
        doc: 'dom',
        type: 'selector',
        spec: 'html'
      },
      excerpt: ''
    }]
  };
};
