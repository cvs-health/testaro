/*
  allCaps
  Related to Tenon rule 153.
  This test reports leaf elements whose text contents contain at least one substring of upper-case
  letters, hyphen-minuses, and spaces at least 8 characters long and no lower-case letters. Blocks
  of upper-case text are difficult to read.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Runs the test and returns the results.
exports.reporter = async (page, withItems) => {
  // Identify the elements with upper-case text longer than 7 characters.
  const nativeLocator = page.locator('body *', {
    hasNot: page.locator('*'),
    hasText: /[- A-Z]{8}/
  });
  const transLocator = page.locator('body [text-transform=uppercase]', {
    hasNot: page.locator('*'),
    hasText: /[- A-Za-z]{8}/
  });
  const nativeLocators = await nativeLocator.all();
  const transLocators = await transLocator.all();
  const elLocators = Array.from(new Set(nativeLocators.concat(transLocators)));
  const data = {
    total: elLocators.length
  };
  if (withItems) {
    data.items = [];
    for (const elLocator of elLocators) {
      const elData = await getLocatorData(elLocator);
      data.items.push(elData);
    }
  }
  // Get data for the standard result.
  const totals = [data.total, 0, 0, 0];
  const standardInstances = [];
  if (withItems) {
    data.items.forEach(item => {
      standardInstances.push({
        ruleID: 'allCaps',
        what: 'Text is entirely upper-case',
        ordinalSeverity: 0,
        tagName: item.tagName,
        id: item.id,
        location: {
          doc: 'dom',
          type: item.location.type,
          spec: item.location.spec
        },
        excerpt: item.text
      });
    });
  }
  else {
    standardInstances.push({
      ruleID: 'allCaps',
      what: 'Texts are entirely upper-case',
      ordinalSeverity: 0,
      count: data.total,
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
