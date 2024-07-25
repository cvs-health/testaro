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
  headEl
  Related to ASLint rule elements-not-allowed-in-head.
  This test reports invalid descendants of the head element in the source of the document.
*/

// ########## IMPORTS

// Module to get the document source.
const {getSource} = require('../procs/getSource');

// ########## FUNCTIONS

// Performs the test.
exports.reporter = async page => {
  // Initialize the data and standard result.
  const data = {
    total: 0,
    badTagNames: []
  };
  let totals = [];
  const standardInstances = [];
  // Get the source.
  const sourceData = await getSource(page);
  // If it was not obtained:
  if (sourceData.prevented) {
    // Report this.
    data.prevented = true;
    data.error = 'ERROR getting page source';
  }
  // Otherwise, i.e. if it was obtained:
  else {
    let rawPage = sourceData.source;
    // Change any spacing character sequences in it to single spaces.
    rawPage = rawPage.replace(/\s+/g, ' ');
    // Delete everything in it except the head content.
    rawPage = rawPage.replace(/^.*<head>|<\/head>.*$/g, '');
    // Delete any scripts from it.
    rawPage = rawPage.replace(/<script[ >].+?<\/script>/g, '');
    // Get the tag names of the remaining elements.
    const tags = rawPage.match(/<([a-z]+)/g);
    const ucTagNames = tags.map(tag => tag.toUpperCase().slice(1));
    const validTagNames = [
      'BASE',
      'LINK',
      'META',
      'SCRIPT',
      'STYLE',
      'TITLE',
      'NOSCRIPT',
      'TEMPLATE'  
    ];
    // For each tag name:
    ucTagNames.forEach(tagName => {
      // If it is invalid:
      if (! validTagNames.includes(tagName)) {
        // Add this to the result.
        data.total++;
        data.badTagNames.push(tagName);
      }
    });
    // If there are any instances:
    if (data.total) {
      // Add a summary instance.
      standardInstances.push({
        ruleID: 'headEl',
        what: `Invalid elements within the head: ${data.badTagNames.join(', ')}`,
        ordinalSeverity: 2,
        count: data.total,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      });
    }
    totals = [0, 0, data.total, 0];
  }
  // Return the data.
  return {
    data,
    totals,
    standardInstances
  };
};
