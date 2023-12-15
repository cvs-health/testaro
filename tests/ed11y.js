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
  // Add the ed11y test script to the page.
  const testScript = await fs.readFile('../ed11y/editoria11y.min.js', 'utf8');
  const results = await page.evaluate(script => {
    const testScript = document.createElement('script');
    testScript.textContent = script;
    document.body.insertAdjacentElement('beforeend', testScript);
  }, testScript);
  // Get the result of that script.
  const rawResultJSON = await page.evaluate(async () => await new Promise(resolve => {
    document.on('edd11yResults', () => {
      const resultObj = Ed11yResults();
      const resultJSON = JSON.stringify(resultObj);
      resolve(resultJSON);
    });
  }));
  const result = JSON.parse(rawResultJSON);
  console.log(JSON.stringify(result, null, 2));
  // Initialize the act report.
  let data = {};
  // Delete irrelevant properties from the tool report details.
  // Return the act report.
  try {
    JSON.stringify(data);
  }
  catch(error) {
    data = {
      prevented: true,
      error: message
    };
  }
  return {
    data,
    result
  };
};
