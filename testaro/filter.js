/*
  filter
  This test reports elements whose styles include filter. The filter style property is considered
  inherently inaccessible, because it modifies the rendering of content, overriding user settings,
  and requires the user to apply custom styles to neutralize it, which is difficult or impossible
  in some user environments.
*/

// ########## IMPORTS

// Module to perform common operations.
const {simplify} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Specify the rule.
  const ruleData = {
    ruleID: 'filter',
    selector: 'body *',
    pruner: async loc => await loc.evaluate(el => {
      const styleDec = window.getComputedStyle(el);
      return styleDec.filter !== 'none';
    }),
    isDestructive: false,
    complaints: {
      instance: 'Element has a filter style',
      summary: 'Elements have filter styles'
    },
    ordinalSeverity: 2,
    summaryTagName: ''
  };
  // Run the test and return the result.
  return await simplify(page, withItems, ruleData);
};
