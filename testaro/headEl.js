/*
  headEl
  This test reports invalid descendants of the head element in the source of the document.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');
// Module to make HTTP requests.
const fetch = require('node-fetch');
// Module to process files.
const fs = require('fs/promises');

// ########## FUNCTIONS

// Performs the test.
exports.reporter = async (page, withItems) => {
  // Initialize the standard result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for all applicable elements.
  const locAll = page.locator('head *');
  const locsAll = await locAll.all();
  console.log(locsAll.length);
  // For each of them:
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
  for (const loc of locsAll) {
    // Get data on it.
    const isValid = await loc.evaluate((element, validTagNames) => {
      return validTagNames.includes(element.tagName);
    }, validTagNames);
    console.log(await loc.innerText());
    console.log(isValid);
    // If it is invalid:
    if (! isValid) {
      // Add to the totals.
      totals[2]++;
      // If itemization is required:
      if (withItems) {
        // Get data on the element.
        const elData = await getLocatorData(loc);
        // Add a standard instance.
        standardInstances.push({
          ruleID: 'headEl',
          what: 'Element is within the head but is not allowed there',
          ordinalSeverity: 2,
          tagName: elData.tagName,
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
  }
  // If itemization is not required and there are any instances:
  if (! withItems && totals[2]) {
    // Add a summary instance.
    standardInstances.push({
      ruleID: 'headEl',
      what: 'Elements within the head are not allowed there',
      ordinalSeverity: 2,
      count: totals[2],
      tagName: '',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
  }
  return {
    data,
    totals,
    standardInstances
  };
};
