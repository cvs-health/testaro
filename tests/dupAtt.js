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
  // Remove any escaped quotation marks from it.
  rawPage = rawPage.replace(/\\"|\\'/g, '');
  // Remove any quoted text from it.
  rawPage = rawPage.replace(/"[^<>\r\n"]*"|'[^<>\r\n']*'/g, '');
  // Remove any script code from it.
  rawPage = rawPage.replace(/<(script [^<>]+)>.*?<\/script>/g, '$1');
  // Remove any comments from it.
  rawPage = rawPage.replace(/<!--.*?-->/g, '');
  // Extract the opening tags of its elements.
  let elements = rawPage.match(/<[a-zA-Z][^<>]+>/g);
  // Delete their enclosing angle brackets and the values of any attributes in them.
  elements = elements.map(el => el.replace(/^< *| *= *"[^"]*"|= *[^ ]+| *>$/g, ''));
  // For each element:
  elements.forEach(element => {
    // Identify its tag name and attributes.
    const terms = element.split(' ');
    // If it has 2 or more attributes:
    if (terms.length > 2) {
      // If any is duplicated:
      const tagName = terms[0].toUpperCase();
      const attributes = terms.slice(1);
      const attSet = new Set(attributes);
      if (attSet.size < attributes.length) {
        // Add this to the data.
        data.total++;
        if (withItems) {
          data.items.push({
            tagName,
            attributes
          });
        }
      }
    }
  });
  // Return the data.
  return {result: data};
};
