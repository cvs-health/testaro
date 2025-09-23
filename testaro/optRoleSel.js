/*
  optRoleSel
  Clean-room rule: elements with role="option" should have an aria-selected attribute.
*/

const {simplify} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  const ruleData = {
    ruleID: 'optRoleSel',
    selector: '[role="option"]',
    pruner: async (loc) => {
      return loc.evaluate(el => {
        return ! el.hasAttribute('aria-selected');
      });
    },
    isDestructive: false,
    complaints: {
      instance: 'Element has an explicit option role but no aria-selected attribute',
      summary: 'Elements with explicit option roles have no aria-selected attributes'
    },
    ordinalSeverity: 1,
    summaryTagName: ''
  };
  return await simplify(page, withItems, ruleData);
};
