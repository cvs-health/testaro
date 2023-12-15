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
  ed11y
  This test implements the Editoria11y ruleset for accessibility.
*/

// IMPORTS

// Module to handle files.
const fs = require('fs/promises');

// FUNCTIONS

// Conducts and reports the Editoria11y tests.
exports.reporter = async (page, options) => {
  // Get the result of the ed11y test script.
  const script = await fs.readFile(`${__dirname}/../ed11y/editoria11y.min.js`, 'utf8');
  const rawResultJSON = await page.evaluate(script => new Promise(resolve => {
    document.addEventListener('ed11yResults', () => {
      const resultArray = Ed11y.results;
      const resultJSON = JSON.stringify(resultArray, null, 2);
      resolve(resultJSON);
    });
    const testScript = document.createElement('script');
    testScript.id = 'testScript';
    testScript.textContent = script;
    document.body.insertAdjacentElement('beforeend', testScript);
    new Ed11y({
      alertMode: 'headless'
    });
  }), script);
  const result = JSON.parse(rawResultJSON);
  let data = {};
  // Delete irrelevant properties from the tool report details.
  // Return the act report.
  return {
    data,
    result
  };
};
