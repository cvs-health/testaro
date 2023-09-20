/*
  allCaps
  Related to Tenon rule 153.
  This test reports elements with native or transformed upper-case text at least 8 characters long.
  Blocks of upper-case text are difficult to read.
*/

// ########## IMPORTS

// Module to perform common operations.
const {simplify} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Specify the rule.
  const ruleData = {
    ruleID: 'allCaps',
    selector: 'body *:not(style, script, svg)',
    pruner: async loc => await loc.evaluate(el => {
      const elText = Array
      .from(el.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(textNode => textNode.nodeValue)
      .join(' ');
      // If the element text includes 8 sequential upper-case letters, spaces, or hyphen-minuses:
      if (/[- A-Z]{8}/.test(elText)) {
        // Report this.
        return true;
      }
      // Otherwise:
      else {
        // Report whether its text is at least 8 characters long and transformed to upper case.
        const elStyleDec = window.getComputedStyle(el);
        const transformStyle = elStyleDec.textTransform;
        return transformStyle === 'uppercase' && elText.length > 7;
      }
    }),
    isDestructive: false,
    complaints: {
      instance: 'Element contains all-capital text',
      summary: 'Elements contain all-capital text'
    },
    ordinalSeverity: 0,
    summaryTagName: ''
  };
  // Run the test and return the result.
  return await simplify(page, withItems, ruleData);
};
