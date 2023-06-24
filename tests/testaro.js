/*
  testaro
  This test implements the Testaro evaluative ruleset for accessibility.
*/

// CONSTANTS

const evalRules = {
  allHidden: 'page that is entirely or mostly hidden',
  autocomplete: 'name and email inputs without autocomplete attributes',
  bulk: 'large count of visible elements',
  docType: 'document without a doctype property',
  dupAtt: 'elements with duplicate attributes',
  embAc: 'active elements embedded in links or buttons',
  filter: 'filter styles on elements',
  focAll: 'discrepancies between focusable and Tab-focused elements',
  focInd: 'missing and nonstandard focus indicators',
  focOp: 'discrepancies between focusability and operability',
  focVis: 'links that are invisible when focused',
  hover: 'hover-caused content changes',
  labClash: 'labeling inconsistencies',
  linkExt: 'links that automatically open new windows',
  linkTo: 'links without destinations',
  linkUl: 'missing underlines on inline links',
  menuNav: 'nonstandard keyboard navigation between focusable menu items',
  miniText: 'text smaller than 11 pixels',
  motion: 'motion without user request',
  nonTable: 'table elements used for layout',
  radioSet: 'radio buttons not grouped into standard field sets',
  role: 'invalid and native-replacing explicit roles',
  styleDiff: 'style inconsistencies',
  tabNav: 'nonstandard keyboard navigation between elements with the tab role',
  targetSize: 'buttons, inputs, and non-inline links smaller than 44 pixels wide and high',
  titledEl: 'title attributes on inappropriate elements',
  zIndex: 'non-default Z indexes'
};
const etcRules = {
  attVal: 'elements with attributes having illicit values',
  elements: 'data on specified elements',
  textNodes: 'data on specified text nodes',
  title: 'page title',
};

// FUNCTIONS

// Conducts and reports a Testaro test.
exports.reporter = async (page, options) => {
  const {withItems, args} = options;
  const argRules = args ? Object.keys(args) : null;
  const rules = options.rules || ['y', ... Object.keys(evalRules)];
  // Initialize the data.
  const data = {
    rules: {}
  };
  // If the rule specification is valid:
  if (
    rules.length > 1
    && ['y', 'n'].includes(rules[0])
    && rules.slice(1).every(rule => evalRules[rule] || etcRules[rule])
  ) {
    // For each rule invoked:
    const realRules = rules[0] === 'y'
      ? rules.slice(1)
      : Object.keys(evalRules).filter(ruleID => ! rules.slice(1).includes(ruleID));
    for (const rule of realRules) {
      // Initialize an argument array.
      const ruleArgs = [page, withItems];
      // If the rule has extra arguments:
      if (argRules && argRules.includes(rule)) {
        // Add them to the argument array.
        ruleArgs.push(... args[rule]);
      }
      // Test the page.
      const what = evalRules[rule] || etcRules[rule];
      if (! data.rules[rule]) {
        data.rules[rule] = {};
      }
      data.rules[rule].what = what;
      console.log(`>>>>>> ${rule} (${what})`);
      const report = await require(`../testaro/${rule}`).reporter(... ruleArgs);
      Object.keys(report).forEach(key => {
        data.rules[rule][key] = report[key];
      });
    }
  }
  // Otherwise, i.e. if the rule specification is invalid:
  else {
    console.log('ERROR: Testaro rule specification invalid');
    data.prevented = true;
    data.error = 'ERROR: Rule specification invalid';
  }
  return {result: data};
};
