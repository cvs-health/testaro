/*
  testaro
  This test implements the Testaro evaluative rules.
*/

// ######## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');
// Module to handle files.
const fs = require('fs/promises');

// ######## CONSTANTS

const evalRules = {
  adbID: 'elements with ambiguous or missing referenced descriptions',
  allCaps: 'leaf elements with entirely upper-case text longer than 7 characters',
  allHidden: 'page that is entirely or mostly hidden',
  allSlanted: 'leaf elements with entirely italic or oblique text longer than 39 characters',
  autocomplete: 'name and email inputs without autocomplete attributes',
  bulk: 'large count of visible elements',
  buttonMenu: 'nonstandard keyboard navigation between items of button-controlled menus',
  captionLoc: 'caption elements that are not first children of table elements',
  datalistRef: 'elements with ambiguous or missing referenced datalist elements',
  distortion: 'distorted text',
  docType: 'document without a doctype property',
  dupAtt: 'elements with duplicate attributes',
  embAc: 'active elements embedded in links or buttons',
  filter: 'filter styles on elements',
  focAll: 'discrepancies between focusable and Tab-focused elements',
  focInd: 'missing and nonstandard focus indicators',
  focOp: 'Tab-focusable elements that are not operable',
  focVis: 'links that are invisible when focused',
  headEl: 'invalid elements within the head',
  headingAmb: 'same-level sibling headings with identical texts',
  hover: 'hover-caused content changes',
  hovInd: 'hover indication nonstandard',
  hr: 'hr element instead of styles used for vertical segmentation',
  imageLink: 'links with image files as their destinations',
  labClash: 'labeling inconsistencies',
  legendLoc: 'legend elements that are not first children of fieldset elements',
  lineHeight: 'text with a line height less than 1.5 times its font size',
  linkExt: 'links that automatically open new windows',
  linkAmb: 'links with identical texts but different destinations',
  linkOldAtt: 'links with deprecated attributes',
  linkTitle: 'links with title attributes repeating text content',
  linkTo: 'links without destinations',
  linkUl: 'missing underlines on inline links',
  miniText: 'text smaller than 11 pixels',
  motion: 'motion without user request',
  nonTable: 'table elements used for layout',
  opFoc: 'Operable elements that are not Tab-focusable',
  optRoleSel: 'Non-option elements with option roles that have no aria-selected attributes',
  phOnly: 'input elements with placeholders but no accessible names',
  pseudoP: 'adjacent br elements suspected of nonsemantically simulating p elements',
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

// ######## FUNCTIONS

// Conducts a JSON-defined test.
const jsonTest = async (ruleID, ruleArgs) => {
  const [page, withItems] = ruleArgs;
  // Get the rule definition.
  const ruleJSON = await fs.readFile(`${__dirname}/../testaro/${ruleID}.json`, 'utf8');
  const ruleObj = JSON.parse(ruleJSON);
  // Initialize the locators and result.
  const all = await init(page, ruleObj.selector);
  all.locs = all.allLocs;
  // Populate and return the result.
  const whats = [
    ruleObj.complaints.instance,
    ruleObj.complaints.summary
  ];
  return await report(
    withItems, all, ruleObj.ruleID, whats, ruleObj.ordinalSeverity, ruleObj.summaryTagName
  );
};
// Conducts and reports Testaro tests.
exports.reporter = async (page, options) => {
  const {withItems, stopOnFail, args} = options;
  const argRules = args ? Object.keys(args) : null;
  const rules = options.rules || ['y', ... Object.keys(evalRules)];
  // Initialize the data.
  const data = {
    rules: {},
    preventions: [],
    testTimes: {}
  };
  // If the rule specification is valid:
  if (
    rules.length > 1
    && ['y', 'n'].includes(rules[0])
    && rules.slice(1).every(rule => evalRules[rule] || etcRules[rule])
  ) {
    // For each rule invoked:
    const calledRules = rules[0] === 'y'
      ? rules.slice(1)
      : Object.keys(evalRules).filter(ruleID => ! rules.slice(1).includes(ruleID));
    const testTimes = [];
    for (const rule of calledRules) {
      // Initialize an argument array.
      const ruleArgs = [page, withItems];
      // If the rule is defined with JavaScript or JSON but not both:
      const ruleFileNames = await fs.readdir(`${__dirname}/../testaro`);
      const isJS = ruleFileNames.includes(`${rule}.js`);
      const isJSON = ruleFileNames.includes(`${rule}.json`);
      if ((isJS || isJSON) && ! (isJS && isJSON)) {
        // If with JavaScript and it has extra arguments:
        if (isJS && argRules && argRules.includes(rule)) {
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
        try {
          const startTime = Date.now();
          const ruleReport = isJS
            ? await require(`../testaro/${rule}`).reporter(... ruleArgs)
            : await jsonTest(rule, ruleArgs);
          // Add data from the test to the result.
          const endTime = Date.now();
          testTimes.push([rule, Math.round((endTime - startTime) / 1000)]);
          Object.keys(ruleReport).forEach(key => {
            data.rules[rule][key] = ruleReport[key];
          });
          data.rules[rule].totals = data.rules[rule].totals.map(total => Math.round(total));
          if (ruleReport.prevented) {
            data.preventions.push(rule);
          }
          // If testing is to stop after a failure and the page failed the test:
          if (stopOnFail && ruleReport.totals.some(total => total)) {
            // Stop testing.
            break;
          }
        }
        // If an error is thrown by the test:
        catch(error) {
          // Report this.
          data.preventions.push(rule);
          console.log(`ERROR: Test of testaro rule ${rule} prevented (${error.message})`);
        }
      }
      // Otherwise, i.e. if the rule is undefined or doubly defined:
      else {
        // Report this.
        console.log(`ERROR: Rule ${rule} not validly defined`);
      }
    }
    testTimes.sort((a, b) => b[1] - a[1]).forEach(pair => {
      data.testTimes[pair[0]] = pair[1];
    });
  }
  // Otherwise, i.e. if the rule specification is invalid:
  else {
    console.log('ERROR: Testaro rule specification invalid');
    data.prevented = true;
    data.error = 'ERROR: Rule specification invalid';
  }
  return {result: data};
};
