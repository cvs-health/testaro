/*
  distortion
  Related to Tenon rule 271.
  This test reports elements whose transform style properties distort the content. Distortion makes
  text difficult to read.
*/

// ########## IMPORTS

// Module to perform common operations.
const {simplify} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Specify the rule.
  const ruleData = {
    ruleID: 'distortion',
    selector: 'body *',
    pruner: async loc => await loc.evaluate(el => {
      const styleDec = window.getComputedStyle(el);
      const {transform} = styleDec;
      return transform
      && ['matrix', 'perspective', 'rotate', 'scale', 'skew'].some(key => transform.includes(key));
    }),
    isDestructive: false,
    complaints: {
      instance: 'Element distorts its text',
      summary: 'Elements distort their texts'
    },
    ordinalSeverity: 1,
    summaryTagName: ''
  };
  // Run the test and return the result.
  return await simplify(page, withItems, ruleData);
};
