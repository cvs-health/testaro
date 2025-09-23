/*
  legendLoc
  Clean-room rule: flag legend elements that are not the first child of a fieldset element.
*/

const {simplify} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  const ruleData = {
    ruleID: 'legendLoc',
    selector: 'legend',
    pruner: async (loc) => {
      return loc.evaluate(el => {
        const parent = el.parentElement;
        if (!parent) return true;
        if (parent.tagName.toUpperCase() !== 'FIELDSET') return true;
        // Check if this legend is the first element child of the fieldset
        for (const child of parent.children) {
          if (child.nodeType === 1) {
            return child !== el; // true if not first child
          }
        }
        return true;
      });
    },
    isDestructive: false,
    complaints: {
      instance: 'Element is not the first child of a fieldset element',
      summary: 'legend elements are not the first children of fieldset elements'
    },
    ordinalSeverity: 3,
    summaryTagName: 'LEGEND'
  };
  return await simplify(page, withItems, ruleData);
};
