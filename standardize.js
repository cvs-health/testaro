/*
  standardize.js
  Converts test reports to the standard format.
*/

// ########## CONSTANTS

const convertibles = ['alfa', 'axe', 'continuum'];

// ########## FUNCTIONS

// Limits the length of and unilinearizes a string.
const cap = rawString => {
  const string = rawString.replace(/\s+/g, ' ');
  if (string && string.length > 400) {
    return `${string.slice(0, 200)} ... ${string.slice(-200)}`;
  }
  else if (string) {
    return string;
  }
  else {
    return '';
  }
};
// Converts nodes of an axe rule.
const doAxeRule = (result, standardResult, certainty) => {
  if (result.details && result.details[certainty]) {
    result.details[certainty].forEach(rule => {
      rule.nodes.forEach(node => {
        const whatSet = new Set([
          rule.help,
          ... node.any.map(anyItem => anyItem.message),
          ... node.all.map(allItem => allItem.message)
        ]);
        const initialSeverity = ['minor', 'moderate', 'serious', 'critical'].indexOf(node.impact);
        const moreSeverity = certainty === 'violations' ? 4 : 0;
        const instance = {
          issueID: rule.id,
          what: Array.from(whatSet.values()).join('; '), 
          ordinalSeverity: initialSeverity + moreSeverity,
          location: {
            type: 'selector',
            spec: node.target && node.target.length ? node.target[0] : '',
          },
          excerpt: cap(node.html)
        };
        standardResult.instances.push(instance);
      });
    });
  }
};
// Converts instances of an htmlcs rule.
const doHTMLCSRule = (result, standardResult, severity) => {
  if (result[severity]) {
    Object.keys(result[severity]).forEach(ruleID => {
      Object.keys(ruleID).forEach(what => {
        result[severity][ruleID][what].forEach(item => {
          const {tagName, code} = item;
          const instance = {
            issueID: ruleID,
            what, 
            ordinalSeverity: ['Warning', 'Error'].indexOf(severity),
            location: {
              type: '',
              spec: '',
            },
            excerpt: cap(`${tagName ? tagName + ': ' : ''}${code || ''}`)
          };
          standardResult.instances.push(instance);
        });
      });
    });
  }
};
// Converts a report.
const convert = (testName, result, standardResult) => {
  // alfa
  if (testName === 'alfa' && result.totals) {
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
        excerpt: cap(item.target.codeLines.join(' '))
      };
      standardResult.instances.push(instance);
    });
  }
  // axe
  else if (
    testName === 'axe'
    && result.totals
    && (result.totals.rulesWarned || result.totals.rulesViolated)
  ) {
    const {totals} = result;
    standardResult.totals = [
      totals.warnings.minor,
      totals.warnings.moderate,
      totals.warnings.serious,
      totals.warnings.critical,
      totals.violations.minor,
      totals.violations.moderate,
      totals.violations.serious,
      totals.violations.critical
    ];
    doAxeRule(result, standardResult, 'incomplete');
    doAxeRule(result, standardResult, 'violations');
  }
  // continuum
  else if (testName === 'continuum' && Array.isArray(result) && result.length) {
    standardResult.totals = [result.length];
    result.forEach(item => {
      const instance = {
        issueID: item.engineTestId.toString(),
        what: item.attributeDetail,
        ordinalSeverity: 0,
        location: {
          type: 'selector',
          spec: item.path,
        },
        excerpt: item.element
      };
      standardResult.instances.push(instance);
    });
  }
  // htmlcs
  else if (testName === 'htmlcs' && result) {
    doHTMLCSRule(result, standardResult, 'Warning');
    doHTMLCSRule(result, standardResult, 'Error');
    const {instances} = standardResult;
    standardResult.totals = [
      instances.filter(instance => instance.ordinalSeverity === 0).length,
      instances.filter(instance => instance.ordinalSeverity === 1).length,
    ];
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
