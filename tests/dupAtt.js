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
    rawPage = await fetch(url);
  }
  // Extract its elements, in a uniform format.
  const elements = rawPage
  .match(/<[^/<>]+>/g)
  .map(element => element.slice(1, -1).trim().replace(/\s*=\s*/g, '='))
  .map(element => element.replace(/\s+/g, ' '));
  // For each element:
  elements.forEach(element => {
    // Identify its attributes.
    const attributes = element.split(' ').slice(1).map(attVal => attVal.replace(/=.+/, ''));
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
