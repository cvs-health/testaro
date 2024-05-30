/*
  © 2023–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  dupAtt.js
  This test reports duplicate attributes in the source of a document.
*/

// ########## IMPORTS

// Module to get the document source.
const {getSource} = require('../procs/getSource');

// ########## FUNCTIONS

// Reports failures.
exports.reporter = async (page, withItems) => {
  // Initialize the data and standard result.
  const data = {total: 0};
  if (withItems) {
    data.items = [];
  }
  let totals = [];
  const standardInstances = [];
  // Get the source.
  const sourceData = await getSource(page);
  // If it was not obtained:
  if (sourceData.prevented) {
    // Report this.
    data.prevented = true;
    data.error = sourceData.error;
  }
  // Otherwise, i.e. if it was obtained:
  else {
    let rawPage = sourceData.source;
    // Change any spacing character sequences in it to single spaces.
    rawPage = rawPage.replace(/\s+/g, ' ');
    // Delete any spaces adjacent to equal symbols in it.
    rawPage = rawPage.replace(/ = | =|= /g, '=');
    // Remove any escaped quotation marks from it.
    rawPage = rawPage.replace(/\\"|\\'/g, '');
    // Remove any script code from it.
    rawPage = rawPage.replace(/<script(?: [^<>]+)?>.*?<\/script>/g, '');
    rawPage = rawPage.replace(/<script(?: [^<>]+)?>/g, '');
    rawPage = rawPage.replace(/<\/script>/g, '');
    // Remove any comments from it.
    rawPage = rawPage.replace(/<!--.*?-->/g, '');
    // Extract the syntactically valid opening tags of its elements.
    let elements = rawPage.match(/<[a-zA-Z]+(?: [^<>]+)?>/g);
    // Delete their enclosing angle brackets and any closing slashes.
    elements = elements.map(element => element.replace(/< ?| ?\/?>/g, ''));
    // Delete the values of any attributes in them.
    const nvElements = elements.map(element => element.replace(/="[^"]*"/g, ''));
    // For each element:
    nvElements.forEach((element, index) => {
      // Identify its tag name and attributes.
      const terms = element.split(' ');
      // If it has 2 or more attributes:
      if (terms.length > 2) {
        // If any is duplicated:
        const tagName = terms[0].toUpperCase();
        const attributes = terms.slice(1);
        attributes.sort();
        const duplicatedAttribute = attributes.find(
          (current, attIndex) => attributes[attIndex + 1] === current
        );
        if (duplicatedAttribute) {
          // Add data on the element to the data.
          const id = terms.includes('id')
            ? elements[index].replace(/^.+id="/, '').replace(/".+/, '')
            : '';
          data.total++;
          if (withItems) {
            data.items.push({
              tagName,
              id,
              duplicatedAttribute
            });
          }
        }
      }
    });
    // If itemization is required and there are any instances:
    if (data.items) {
      // For each instance:
      data.items.forEach(item => {
        // Add it.
        standardInstances.push({
          ruleID: 'dupAtt',
          what: 'Element has 2 attributes with the same name',
          ordinalSeverity: 2,
          tagName: item.tagName,
          id: item.id,
          location: {
            doc: item.id ? 'source' : '',
            type: item.id ? 'selector' : '',
            spec: item.id ? `#${item.id}` : ''
          },
          excerpt: item.duplicatedAttribute
        });
      });
    }
    // Otherwise, if there are any instances:
    else if (data.total) {
      // Add a summary instance.
      standardInstances.push({
        ruleID: 'dupAtt',
        what: 'In some elements 2 attributes have the same name',
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
