// Populates the result.

// ########## IMPORTS

// Module to sample a population.
const {getSample} = require('../procs/sample');
// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## CONSTANTS

let sampleSize = 100;

// ########## FUNCTIONS

// Initializes locators and a result.
exports.init = async (page, locAllSelector, options = {}) => {
  // Get locators for the specified elements.
  const locWholePopulation = page.locator(locAllSelector, options);
  const populationSize = locWholePopulation.length;
  sampleSize = Math.min(sampleSize, populationSize);
  const locAll = getSample(locWholePopulation, sampleSize);
  const allLocs = await locAll.all();
  const result = {
    data: {},
    totals: [0, 0, 0, 0],
    standardInstances: []
  };
  if (populationSize > sampleSize) {
    data.sampling = {
      populationSize,
      sampleSize,
      sampleRatio: Math.round(100 * sampleSize / populationSize) / 100
    };
  }
  // Return the result.
  return {
    allLocs,
    locs: [],
    result
  };
};

// Populates a result.
exports.report = async (withItems, all, ruleID, whats, ordinalSeverity, tagName = '') => {
  const {locs, result} = all;
  const {totals, standardInstances} = result;
  // For each instance locator:
  for (const locItem of locs) {
    // Get data on its element.
    let loc, whatParam;
    if (Array.isArray(locItem)) {
      loc = locItem[0];
      whatParam = locItem[1];
    }
    else {
      loc = locItem;
    }
    const elData = await getLocatorData(loc);
    // Add to the totals.
    totals[ordinalSeverity] += populationSize / sampleSize;
    // If itemization is required:
    if (withItems) {
      // Add a standard instance to the result.
      standardInstances.push({
        ruleID,
        what: whatParam ? whats[0].replace('__param__', whatParam) : whats[0],
        ordinalSeverity,
        tagName: elData.tagName,
        id: elData.id,
        location: elData.location,
        excerpt: elData.excerpt
      });
    }
  }
  // If itemization is not required and any instances exist:
  if (! withItems && locs.length) {
    // Add a summary standard instance to the result.
    standardInstances.push({
      ruleID,
      what: whats[1],
      ordinalSeverity,
      count: Math.round(totals[ordinalSeverity]),
      tagName,
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
  return result;
};
