/*
  dupAtt.js
  This test reports duplicate attributes in the source of a document.
*/

// ########## IMPORTS

// Module to make HTTP requests.
const fetch = require('node-fetch');
// Module to process files.
const fs = require('fs/promises');

// ########## FUNCTIONS

// Reports failures.
exports.reporter = async (page, withItems) => {
  // Initialize the data.
  const data = {total: 0};
  if (withItems) {
    data.items = [];
  }
  // Get the page.
  const url = page.url();
  const scheme = url.replace(/:.+/, '');
  let rawPage;
  if (scheme === 'file') {
    const filePath = url.slice(7);
    rawPage = await fs.readFile(filePath, 'utf8');
  }
  else {
    try {
      const rawPageResponse = await fetch(url);
      rawPage = await rawPageResponse.text();
    }
    catch(error) {
      console.log(`ERROR getting page for dupAtt test (${error.message})`);
      data.prevented = true;
      return {result: data};
    }
  }
  // Change any spacing character sequences in it to single spaces.
  rawPage = rawPage.replace(/\s+/g, ' ');
  // Delete any spaces adjacent to equal symbols in it.
  rawPage = rawPage.replace(/ = | =|= /g, '=');
  // Remove any escaped quotation marks from it.
  rawPage = rawPage.replace(/\\"|\\'/g, '');
  // Remove any quoted text from it.
  rawPage = rawPage.replace(/"[^"]*"|'[^']*'/g, '');
  // Remove any script code from it.
  rawPage = rawPage.replace(/<(script [^<>]+)>.*?<\/script>/g, '$1');
  // Remove any comments from it.
  rawPage = rawPage.replace(/<!--.*?-->/g, '');
  // Extract the opening tags of its elements.
  let elements = rawPage.match(/<[a-zA-Z][^<>]+>/g);
  // Delete their enclosing angle brackets and the values of any attributes in them.
  const elementsWithVals = elements.map(el => el.replace(/^< *| *>$/g, ''));
  const elementsWithoutVals = elementsWithVals.map(el => el.replace(/^ *|=[^ ]*$/g, ''));
  // For each element:
  elementsWithoutVals.forEach((elementWithoutVals, index) => {
    // Identify its tag name and attributes.
    const terms = elementWithoutVals.split(' ');
    // If it has 2 or more attributes:
    if (terms.length > 2) {
      // If any is duplicated:
      const tagName = terms[0].toUpperCase();
      const attributes = terms.slice(1);
      const attSet = new Set(attributes);
      if (attSet.size < attributes.length) {
        // Add it to the data.
        data.total++;
        if (withItems) {
          data.items.push({
            tagName,
            id: terms.includes('id')
              ? elementsWithVals[index].replace(/^.+id=/, '').replace(/ .*$/, '')
              : '',
            attributes
          });
        }
      }
    }
  });
  const standardInstances = [];
  if (data.items) {
    data.items.forEach(item => {
      standardInstances.push({
        issueID: 'dupAtt',
        what: `Element ${item.tagName} has 2 attributes with the same name`,
        ordinalSeverity: 2,
        tagName: item.tagName,
        id: item.id,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: item.attributes.join(' ... ')
      });
    });
  }
  else if (data.total) {
    standardInstances.push({
      issueID: 'dupAtt',
      what: 'In some elements 2 attributes have the same name',
      ordinalSeverity: 2,
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
  }
  // Return the data.
  return {
    data,
    totals: [0, 0, data.total, 0],
    standardInstances
  };
};
