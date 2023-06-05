/*
  standardize.js
  Converts test results to the standard format.
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
        const severityWeights = {
          minor: 0,
          moderate: 0,
          serious: 1,
          critical: 1
        };
        const ordinalSeverity = severityWeights[node.impact] + (certainty === 'violations' ? 2 : 0);
        const instance = {
          issueID: rule.id,
          what: Array.from(whatSet.values()).join('; '), 
          ordinalSeverity,
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
            ordinalSeverity: ['Warning', '', '', 'Error'].indexOf(severity),
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
      // Include the message twice, because in scoring it is likely to be replaced by a pattern.
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
        instance.ordinalSeverity = subType === 'fatal' ? 3 : 2;
      }
      standardResult.instances.push(instance);
    });
  }
};
// Converts instances of a qualWeb rule class.
const doQualWeb = (result, standardResult, ruleClassName) => {
  if (result.modules && result.modules[ruleClassName]) {
    const ruleClass = result.modules[ruleClassName];
    const severities = {
      'best-practices': {
        warning: 0,
        failed: 1
      },
      'wcag-techniques': {
        warning: 0,
        failed: 2
      },
      'act-rules': {
        warning: 1,
        failed: 3
      }
    };
    Object.keys(ruleClass.assertions).forEach(rule => {
      const ruleResult = ruleClass.assertions[rule];
      ruleResult.results.forEach(item => {
        item.elements.forEach(element => {
          const instance = {
            issueID: rule,
            what: ruleResult.description,
            ordinalSeverity: severities[ruleClassName][item.verdict],
            location: {
              doc: 'dom',
              type: 'selector',
              spec: element.pointer
            },
            excerpt: cap(element.htmlCode)
          };
          standardResult.instances.push(instance);
          standardResult.totals[instance.ordinalSeverity]++;
        });
      });
    });
  }
};
// Converts instances of a wave rule category.
const doWAVE = (result, standardResult, categoryName) => {
  if (result.categories && result.categories[categoryName]) {
    const category = result.categories[categoryName];
    const ordinalSeverity = categoryName === 'alert' ? 0 : 3;
    Object.keys(category.items).forEach(rule => {
      category.items[rule].selectors.forEach(selector => {
        const instance = {
          issueID: rule,
          what: category.items[rule].description,
          ordinalSeverity,
          location: {
            doc: 'dom',
            type: 'selector',
            spec: selector
          },
          excerpt: ''
        };
        standardResult.instances.push(instance);
      });
    });
  }
};
// Converts a result.
const convert = (toolName, result, standardResult) => {
  // alfa
  if (toolName === 'alfa' && result.totals) {
    standardResult.totals = [result.totals.warnings, 0, 0, result.totals.failures];
    result.items.forEach(item => {
      const instance = {
        issueID: item.rule.ruleID,
        what: item.rule.ruleSummary,
        ordinalSeverity: ['cantTell', '', '', 'failed'].indexOf(item.verdict),
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
    toolName === 'axe'
    && result.totals
    && (result.totals.rulesWarned || result.totals.rulesViolated)
  ) {
    const {totals} = result;
    standardResult.totals = [
      totals.warnings.minor + totals.warnings.moderate,
      totals.warnings.serious + totals.warnings.critical,
      totals.violations.minor + totals.violations.moderate,
      totals.violations.serious + totals.violations.critical
    ];
    doAxe(result, standardResult, 'incomplete');
    doAxe(result, standardResult, 'violations');
  }
  // continuum
  else if (toolName === 'continuum' && Array.isArray(result) && result.length) {
    standardResult.totals = [0, 0, 0, result.length];
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
  else if (toolName === 'htmlcs' && result) {
    doHTMLCS(result, standardResult, 'Warning');
    doHTMLCS(result, standardResult, 'Error');
    const {instances} = standardResult;
    standardResult.totals = [
      instances.filter(instance => instance.ordinalSeverity === 0).length,
      0,
      0,
      instances.filter(instance => instance.ordinalSeverity === 3).length
    ];
  }
  // ibm
  else if (toolName === 'ibm' && result.totals) {
    standardResult.totals = [0, result.totals.recommendation, 0, result.totals.violation];
    result.items.forEach(item => {
      const instance = {
        issueID: item.ruleId,
        what: item.message,
        ordinalSeverity: ['', 'recommendation', '', 'violation'].indexOf(item.level),
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
  else if (toolName === 'nuVal' && (result.pageContent || result.rawPage)) {
    if (result.pageContent) {
      doNuVal(result, standardResult, 'pageContent');
    }
    if (result.rawPage) {
      doNuVal(result, standardResult, 'rawPage');
    }
    const {instances} = standardResult;
    standardResult.totals = [
      instances.filter(instance => instance.ordinalSeverity === 0).length,
      0,
      instances.filter(instance => instance.ordinalSeverity === 2).length,
      instances.filter(instance => instance.ordinalSeverity === 3).length,
    ];
  }
  // qualWeb
  else if (
    toolName === 'qualWeb'
    && result.modules
    && (
      result.modules['act-rules']
      || result.modules['wcag-techniques']
      || result.modules['best-practices']
    )
  ) {
    standardResult.totals = [0, 0, 0, 0];
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
  // tenon
  else if (toolName === 'tenon' && result.data && result.data.resultSet) {
    result.data.resultSet.forEach(item => {
      const instance = {
        issueID: item.tID ? item.tID.toString() : '',
        what: item.errorTitle || '',
        ordinalSeverity: Math.min(
          3, Math.max(0, Math.round((item.certainty || 0) * (item.priority || 0) / 3333))
        ),
        location: {
          doc: 'dom',
          type: 'xpath',
          spec: item.xpath || ''
        },
        excerpt: cap(item.errorSnippet || '')
      };
      standardResult.instances.push(instance);
    });
    standardResult.totals = [0, 0, 0, 0];
    standardResult.instances.forEach(instance => {
      standardResult.totals[instance.ordinalSeverity]++;
    });
  }
  // testaro
  else if (toolName === 'testaro') {
    const rules = result.rules ? Object.keys(result.rules) : [];
    standardResult.totals = [0, 0, 0, 0];
    rules.forEach(rule => {
      const ruleResult = result.rules[rule];
      standardResult.totals.forEach((total, index) => {
        standardResult.totals[index] += ruleResult && ruleResult.totals
          ? ruleResult.totals[index] || 0
          : 0;
      });
      if (ruleResult.standardInstances) {
        standardResult.instances.push(... ruleResult.standardInstances);
      }
      else {
        console.log(`ERROR: Testaro rule ${rule} result has no standardInstances property`);
      }
    });
    standardResult.totals = standardResult.totals.map(total => Math.round(total));
  }
  // wave
  else if (
    toolName === 'wave'
    && result.categories
    && (
      result.categories.error
      || result.categories.contrast
      || result.categories.alert
    )
  ) {
    const {categories} = result;
    standardResult.totals = [
      categories.alert.count || 0,
      0,
      0,
      (categories.error.count || 0) + (categories.contrast.count || 0)
    ];
    ['error', 'contrast', 'alert'].forEach(categoryName => {
      doWAVE(result, standardResult, categoryName);
    });
  }
};
// Converts the results.
exports.standardize = act => {
  const {which} = act;
  const {result, standardResult} = act;
  if (which && result && standardResult) {
    convert(which, result, standardResult);
  }
  else {
    console.log('ERROR: Result of incomplete act cannot be standardized');
  }
};
