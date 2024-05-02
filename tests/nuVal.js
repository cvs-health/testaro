/*
  © 2022–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  nuVal
  This tool subjects a page and its source to the Nu Html Checker, thereby testing scripted
  content found only in the loaded page and erroneous content before the browser corrects it.
  The API erratically replaces left and right double quotation marks with invalid UTF-8, which
  appears as 2 or 3 successive instances of the replacement character (U+fffd). Therefore, this
  test removes all such quotation marks and the replacement character. That causes
  'Bad value “” for' to become 'Bad value  for'. Since the corruption of quotation marks is
  erratic, no better solution is known.
*/

// IMPORTS

// Module to process files.
const fs = require('fs/promises');
// Module to get the document source.
const {getSource} = require('../procs/getSource');

// FUNCTIONS

// Conducts and reports the Nu Html Checker tests.
exports.reporter = async (page, options) => {
  const {rules} = options;
  // Get the browser-parsed page.
  const pageContent = await page.content();
  // Get the source.
  const sourceData = await getSource(page);
  // If it was not obtained:
  const data = {};
  const result = {};
  if (sourceData.prevented) {
    // Report this.
    data.prevented = true;
    data.error = sourceData.error;
  }
  // Otherwise, i.e. if it was obtained:
  else {
    // Get results from validator.w3.org, a more reliable service than validator.nu.
    const fetchOptions = {
      method: 'post',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'text/html; charset=utf-8'
      }
    };
    const nuURL = 'https://validator.w3.org/nu/?parser=html&out=json';
    // For each page type:
    for (const page of [['pageContent', pageContent], ['rawPage', sourceData.source]]) {
      try {
        // Get a Nu Html Checker report on it.
        fetchOptions.body = page[1];
        const nuResult = await fetch(nuURL, fetchOptions);
        const nuData = await nuResult.json();
        // Delete left and right quotation marks and their erratic invalid replacements.
        const nuDataClean = JSON.parse(JSON.stringify(nuData).replace(/[\u{fffd}“”]/ug, ''));
        result[page[0]] = nuDataClean;
        // If there is a report and rules were specified:
        if (! result[page[0]].error && rules && Array.isArray(rules) && rules.length) {
          // Remove all messages except those specified.
          result[page[0]].messages = result[page[0]].messages.filter(message => rules.some(rule => {
            if (rule[0] === '=') {
              return message.message === rule.slice(1);
            }
            else if (rule[0] === '~') {
              return new RegExp(rule.slice(1)).test(message.message);
            }
            else {
              console.log(`ERROR: Invalid nuVal rule ${rule}`);
              return false;
            }
          }));
        }
      }
      catch (error) {
        const message = `ERROR getting results for ${page[0]} (${error.message})`;
        console.log(message);
        data.prevented = true;
        data.error = message;
      };
    };
  }
  return {
    data,
    result
  };
};
