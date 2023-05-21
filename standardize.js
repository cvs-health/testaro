/*
  standardize.js
  Converts test reports to the standard format.
*/

// ########## CONSTANTS

const convertibles = ['alfa'];

// ########## FUNCTIONS

// Converts an alfa report.
const convert = (testName, result, standardResult) => {
  if (testName === 'alfa') {
    standardResult.totals = [result.totals.warnings, result.totals.failures];
    result.items.forEach(item => {
      const instance = {
        issueID: item.rule.ruleID,
        what: item.rule.ruleSummary,
        ordinalSeverity: ['cantTell', 'failed'].indexOf(item.verdict),
        location: {
          type: 'xpath',
          spec: item.target.path,
        },
        excerpt: item.target.codeLines
      };
      standardResult.instances.push(instance);
    });
  }
};
// Converts the convertible reports.
exports.standardize = act => {
  const {which} = act;
  const {result, standardResult} = act;
  if (convertibles.includes(which)) {
    convert(which, result, standardResult);
  }
};
