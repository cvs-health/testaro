/*
  pseudoP
  Related to Tenon rule 242.
  This test reports 2 or more sequential br elements. They may be inferior substitutes for a
  p element.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Get locators for body elements with br descendants.
  const locAll = page.locator('body *', {has: page.locator('br')});
  const locs = await locAll.all();
  // For each of them:
  for (const loc of locs) {
    // Get whether it contains adjacent br children without intervening nonspacing text.
    const hasBrBr = await loc.evaluate(element => {
      const has2Br = element.querySelector('br + br');
      if (has2Br) {
        const childNodes = Array.from(element.childNodes);
        const nsChildNodes = childNodes.filter(
          node => node.nodeType !== Node.TEXT_NODE || node.nodeValue.replace(/\s/g, '').length
        );
        return nsChildNodes.some(
          (node, index) => node.nodeName === 'BR' && nsChildNodes[index + 1].nodeName === 'BR'
        );
      }
      else {
        return false;
      }
    });
    // If so:
    if (hasBrBr) {
      // Add to the totals.
      totals[0]++;
      // If itemization is required:
      if (withItems) {
        // Get data on the element.
        const elData = await getLocatorData(loc);
        // Add an instance to the result.
        standardInstances.push({
          ruleID: 'pseudoP',
          what: 'Element contains 2 or more adjacent br elements that may be nonsemantic substitute for a p element',
          ordinalSeverity: 0,
          tagName: elData.tagName,
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
  }
  // If itemization is not required:
  if (! withItems) {
    // Add a summary instance to the result.
    standardInstances.push({
      ruleID: 'pseudoP',
      what: 'Elements contain 2 or more adjacent br elements that may be nonsemantic substitutes for p elements',
      ordinalSeverity: 0,
      count: totals[0],
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
  // Return the result.
  return {
    data,
    totals,
    standardInstances
  };
};
