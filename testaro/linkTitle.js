/*
  linkTitle
  Related to Tenon rule 79.
  This test reports links with title attributes whose values the link text contains.
*/

// ########## IMPORTS

// Module to perform common operations.
const {simplify} = require('../procs/testaro');
// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Specify the rule.
  const ruleData = {
    ruleID: 'linkTitle',
    selector: 'a[title]',
    pruner: async loc => {
      const elData = await getLocatorData(loc);
      const title = await loc.getAttribute('title');
      return elData.excerpt.toLowerCase().includes(title.toLowerCase());
    },
    isDestructive: false,
    complaints: {
      instance: 'Link has a title attribute that repeats link text content',
      summary: 'Links have title attributes that repeat link text contents'
    },
    ordinalSeverity: 0,
    summaryTagName: 'A'
  };
  // Run the test and return the result.
  return await simplify(page, withItems, ruleData);
};
