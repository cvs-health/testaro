/*
  standardize.js
  Converts test reports to the standard format.
*/

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
            doc: 'dom',
            type: 'selector',
            spec: node.target && node.target.length ? node.target[0] : ''
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
      const ruleData = result[severity][ruleID];
      Object.keys(ruleData).forEach(what => {
        ruleData[what].forEach(item => {
          const {tagName, code} = item;
          const instance = {
            issueID: ruleID,
            what,
            ordinalSeverity: ['Warning', 'Error'].indexOf(severity),
            location: {
              doc: 'dom',
              type: '',
              spec: ''
            },
            excerpt: cap(`${tagName ? tagName + ': ' : ''}${code || ''}`)
          };
          standardResult.instances.push(instance);
        });
      });
    });
  }
};
// Converts instances of a nuVal rule.
const doNuValRule = (result, standardResult, docType) => {
  const items = result[docType] && result[docType].messages;
  if (items && items.length) {
    items.forEach(item => {
      const instance = {
        issueID: item.message,
        what: item.message,
        ordinalSeverity: -1,
        location: {
          doc: docType,
          type: 'line',
          spec: item.lastLine.toString()
        },
        excerpt: cap(item.extract)
      };
      const {type, subType} = item;
      if (type === 'info' && subType === 'warning') {
        instance.ordinalSeverity = 0;
      }
      else if (type === 'error') {
        instance.ordinalSeverity = subType === 'fatal' ? 2 : 1;
      }
      standardResult.instances.push(instance);
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
          doc: 'dom',
          type: 'xpath',
          spec: item.target.path
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
          doc: 'dom',
          type: 'selector',
          spec: item.path
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
      instances.filter(instance => instance.ordinalSeverity === 1).length
    ];
  }
  // ibm
  else if (testName === 'ibm' && result.totals) {
    standardResult.totals = [result.totals.recommendation, result.totals.violation];
    result.items.forEach(item => {
      const instance = {
        issueID: item.ruleId,
        what: item.message,
        ordinalSeverity: ['recommendation', 'violation'].indexOf(item.level),
        location: {
          doc: 'dom',
          type: 'xpath',
          spec: item.path.dom
        },
        excerpt: cap(item.snippet)
      };
      standardResult.instances.push(instance);
    });
  }
  // nuVal
  else if (testName === 'nuVal' && (result.pageContent || result.rawPage)) {
    if (result.pageContent) {
      doNuValRule(result, standardResult, 'pageContent');
    }
    if (result.rawPage) {
      doNuValRule(result, standardResult, 'rawPage');
    }
    const {instances} = standardResult;
    standardResult.totals = [
      instances.filter(instance => instance.ordinalSeverity === 0).length,
      instances.filter(instance => instance.ordinalSeverity === 1).length,
      instances.filter(instance => instance.ordinalSeverity === 2).length
    ];
  }
};
// Converts the convertible reports.
exports.standardize = act => {
  const {which} = act;
  const {result, standardResult} = act;
  convert(which, result, standardResult);
};
