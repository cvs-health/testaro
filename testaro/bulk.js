/*
  © 2021–2023 CVS Health and/or one of its affiliates. All rights reserved.

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
  bulk
  This test reports the count of visible elements.

  The test assumes that simplicity and compactness, with one page having one purpose,
  is an accessibility virtue. Users with visual, motor, and cognitive disabilities
  often have trouble finding what they want or understanding the purpose of a page
  if the page is cluttered with content.
*/
exports.reporter = async page => {
  const data = {};
  await page.waitForSelector('body', {timeout: 10000})
  .catch(error => {
    console.trace(`ERROR (${error.message})`);
    data.prevented = true;
    data.error = 'ERROR: bulk timed out';
    return {result: data};
  });
  const visiblesLoc = await page.locator('body :visible');
  const visibleLocs = await visiblesLoc.all();
  data.visibleElements = visibleLocs.length;
  const severity = Math.min(4, Math.round(data.visibleElements / 400));
  const totals = [0, 0, 0, 0];
  if (severity) {
    totals[severity - 1] = 1;
  }
  return {
    data,
    totals,
    standardInstances: data.visibleElements < 200 ? [] : [{
      ruleID: 'bulk',
      what: 'Page contains a large number of visible elements',
      ordinalSeverity: severity - 1,
      tagName: 'HTML',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    }]
  };
};
