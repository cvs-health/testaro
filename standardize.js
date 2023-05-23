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
// Converts issue instances at an axe certainty level.
const doAxe = (result, standardResult, certainty) => {
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
// Converts issue instances at an htmlcs severity level.
const doHTMLCS = (result, standardResult, severity) => {
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
// Converts issue instances from a nuVal document type.
const doNuVal = (result, standardResult, docType) => {
  const items = result[docType] && result[docType].messages;
  if (items && items.length) {
    items.forEach(item => {
      const instance = {
        issueID: item.message,
        what: item.message,
        ordinalSeverity: -1,
        location: {
          doc: docType === 'pageContent' ? 'dom' : 'source',
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
// Converts instances of a qualWeb rule class.
const doQualWeb = (result, standardResult, ruleClassName) => {
  if (result.modules && result.modules[ruleClassName]) {
    const ruleClass = result.modules[ruleClassName];
    let classSeverity = 0;
    if (ruleClass.metadata) {
      classSeverity = 2 * [
        'best-practices', 'wcag-techniques', 'act-rules'
      ].indexOf(ruleClassName);
      standardResult.totals[classSeverity] += ruleClass.metadata.warning;
      standardResult.totals[classSeverity + 1] += ruleClass.metadata.failed;
    }
    Object.keys(ruleClass.assertions).forEach(rule => {
      ruleClass.assertions[rule].results.forEach(item => {
        item.elements.forEach(element => {
          const instance = {
            issueID: ruleClass.assertions[rule].name,
            what: ruleClass.assertions[rule].description,
            ordinalSeverity: classSeverity + (item.verdict === 'failed' ? 1 : 0),
            location: {
              doc: 'dom',
              type: 'selector',
              spec: element.pointer
            },
            excerpt: cap(element.htmlCode)
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
    doAxe(result, standardResult, 'incomplete');
    doAxe(result, standardResult, 'violations');
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
    doHTMLCS(result, standardResult, 'Warning');
    doHTMLCS(result, standardResult, 'Error');
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
      doNuVal(result, standardResult, 'pageContent');
    }
    if (result.rawPage) {
      doNuVal(result, standardResult, 'rawPage');
    }
    const {instances} = standardResult;
    standardResult.totals = [
      instances.filter(instance => instance.ordinalSeverity === 0).length,
      instances.filter(instance => instance.ordinalSeverity === 1).length,
      instances.filter(instance => instance.ordinalSeverity === 2).length
    ];
  }
  // qualWeb
  else if (
    testName === 'qualWeb'
    && result.modules
    && (
      result.modules['act-rules']
      || result.modules['wcag-techniques']
      || result.modules['best-practices']
    )
  ) {
    standardResult.totals = [0, 0, 0, 0, 0, 0];
    if (result.modules['act-rules']) {
      doQualWeb(result, standardResult, 'act-rules');
    }
    if (result.modules['wcag-techniques']) {
      doQualWeb(result, standardResult, 'wcag-techniques');
    }
    if (result.modules['best-practices']) {
      doQualWeb(result, standardResult, 'best-practices');
    }
  }
};
// Converts the convertible reports.
exports.standardize = act => {
  const {which} = act;
  const {result, standardResult} = act;
  convert(which, result, standardResult);
};
