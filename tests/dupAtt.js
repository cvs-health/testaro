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
  // Extract the opening tags of its elements.
  let elements = rawPage.match(/<[^/<>]+>/g);
  // Delete their enclosing angle brackets and the values of any attributes in them.
  elements = elements.map(el => el.replace(/^<\s*|\s*=\s*"[^"]*"|=\s*[^\s]+|\s*>$/g, ''));
  // Change any spacing character sequences in them to single spaces.
  elements = elements.map(el => el.replace(/\s+/g, ' '));
  // For each element:
  elements.forEach(element => {
    // Identify its attributes.
    const attributes = element.split(' ').slice(1);
    // If any is duplicated:
    const attSet = new Set(attributes);
    if (attSet.size < attributes.length) {
      // Add this to the data.
      data.total++;
      if (withItems) {
        data.items.push(element);
      }
    }
  });
  // Return the data.
  return {result: data};
};
