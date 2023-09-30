/*
  standardize.js
  Converts test results to the standard format.
*/

// ########## FUNCTIONS

// Limits the length of and unilinearizes a string.
const cap = rawString => {
  const string = (rawString || '').replace(/[\s\u2028\u2029]+/g, ' ');
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
// Returns the tag name and the value of an id attribute from a substring of HTML code.
const getIdentifiers = code => {
  let tagName = '';
  let id = '';
  // If the substring includes the start tag of an element:
  if (code && typeof code === 'string' && code.length && /<\s*[a-zA-Z]/.test(code)) {
    // Get the first start tag in the substring.
    const startTag = code.replace(/^.*?<(?=[a-zA-Z])/s, '').replace(/>.*$/s, '').trim();
    // If it exists:
    if (startTag && startTag.length) {
      // Get its tag name, upper-cased.
      tagName = startTag.replace(/\s.*$/s, '').toUpperCase();
      // Get the value of the id attribute of the start tag, if any.
      const idArray = startTag.match(/\sid="([^"<>]+)"/);
      if (idArray && idArray.length === 2) {
        id = idArray[1];
      }
    }
  }
  return [tagName, id];
};
// Specifies conversions of rule IDs of aslint based on what substrings.
const aslintData = {
  'misused-required-attribute': [
    ['not needed', 'misused-required-attributeR']
  ],
  'accessible-svg': [
    ['associated', 'accessible-svgI'],
    ['tabindex', 'accessible-svgT']
  ],
  'audio-alternative': [
    ['track', 'audio-alternativeT'],
    ['alternative', 'audio-alternativeA'],
    ['bgsound', 'audio-alternativeB']
  ],
  'table-missing-description': [
    ['describedby', 'associated', 'table-missing-descriptionDM'],
    ['labeledby', 'associated', 'table-missing-descriptionLM'],
    ['caption', 'not been defined', 'table-missing-descriptionC'],
    ['summary', 'empty', 'table-missing-descriptionS'],
    ['describedby', 'empty', 'table-missing-descriptionDE'],
    ['labeledby', 'empty', 'table-missing-descriptionLE'],
    ['caption', 'no content', 'table-missing-descriptionE']
  ],
  'label-implicitly-associated': [
    ['only whice spaces', 'label-implicitly-associatedW'],
    ['more than one', 'label-implicitly-associatedM']
  ],
  'label-inappropriate-association': [
    ['Missing', 'label-inappropriate-associationM'],
    ['non-form', 'label-inappropriate-associationN']
  ],
  'table-row-and-column-headers': [
    ['headers', 'table-row-and-column-headersRC'],
    ['Content', 'table-row-and-column-headersB'],
    ['head of the columns', 'table-row-and-column-headersH']
  ],
  'color-contrast-state-pseudo-classes-abstract': [
    ['position: fixed', 'color-contrast-state-pseudo-classes-abstractF'],
    ['transparent', 'color-contrast-state-pseudo-classes-abstractB'],
    ['least 3:1', 'color-contrast-state-pseudo-classes-abstract3'],
    ['least 4.5:1', 'color-contrast-state-pseudo-classes-abstract4']
  ],
  'color-contrast-state-pseudo-classes-active': [
    ['position: fixed', 'color-contrast-state-pseudo-classes-abstractF'],
    ['transparent', 'color-contrast-state-pseudo-classes-abstractB'],
    ['least 3:1', 'color-contrast-state-pseudo-classes-abstract3'],
    ['least 4.5:1', 'color-contrast-state-pseudo-classes-abstract4']
  ],
  'color-contrast-state-pseudo-classes-focus': [
    ['position: fixed', 'color-contrast-state-pseudo-classes-abstractF'],
    ['transparent', 'color-contrast-state-pseudo-classes-abstractB'],
    ['least 3:1', 'color-contrast-state-pseudo-classes-abstract3'],
    ['least 4.5:1', 'color-contrast-state-pseudo-classes-abstract4']
  ],
  'color-contrast-state-pseudo-classes-hover': [
    ['position: fixed', 'color-contrast-state-pseudo-classes-abstractF'],
    ['transparent', 'color-contrast-state-pseudo-classes-abstractB'],
    ['least 3:1', 'color-contrast-state-pseudo-classes-abstract3'],
    ['least 4.5:1', 'color-contrast-state-pseudo-classes-abstract4']
  ],
  'color-contrast-aaa': [
    ['transparent', 'color-contrast-aaaB'],
    ['least 4.5:1', 'color-contrast-aaa4'],
    ['least 7:1', 'color-contrast-aaa7']
  ],
  'animation': [
    ['duration', 'animationD'],
    ['iteration', 'animationI'],
    ['mechanism', 'animationM']
  ],
  'page-title': [
    ['empty', 'page-titleN'],
    ['not identify', 'page-titleU']
  ]
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
        const identifiers = getIdentifiers(node.html);
        const instance = {
          ruleID: rule.id,
          what: Array.from(whatSet.values()).join('; '),
          ordinalSeverity,
          tagName: identifiers[0],
          id: identifiers[1],
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
          const {tagName, id, code} = item;
          const instance = {
            ruleID,
            what,
            ordinalSeverity: ['Warning', '', '', 'Error'].indexOf(severity),
            tagName: tagName.toUpperCase(),
            id: id.slice(1),
            location: {
              doc: 'dom',
              type: '',
              spec: ''
            },
            excerpt: cap(code)
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
      const identifiers = getIdentifiers(item.extract);
      if (! identifiers[0] && item.message) {
        const tagNameLCArray = item.message.match(
          /^Element ([^ ]+)|^An (img) element| (meta|script) element| element (script)| tag (script)/
        );
        if (tagNameLCArray && tagNameLCArray.length > 1) {
          identifiers[0] = tagNameLCArray[1].toUpperCase();
        }
      }
      // Include the message twice. A scoring procedure may replace the ruleID with a pattern.
      const instance = {
        ruleID: item.message,
        what: item.message,
        ordinalSeverity: -1,
        tagName: identifiers[0],
        id: identifiers[1],
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
    Object.keys(ruleClass.assertions).forEach(ruleID => {
      const ruleResult = ruleClass.assertions[ruleID];
      ruleResult.results.forEach(item => {
        item.elements.forEach(element => {
          const {htmlCode} = element;
          const identifiers = getIdentifiers(htmlCode);
          const instance = {
            ruleID,
            what: item.description,
            ordinalSeverity: severities[ruleClassName][item.verdict],
            tagName: identifiers[0],
            id: identifiers[1],
            location: {
              doc: 'dom',
              type: 'selector',
              spec: element.pointer
            },
            excerpt: cap(htmlCode)
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
    Object.keys(category.items).forEach(ruleID => {
      category.items[ruleID].selectors.forEach(selector => {
        let tagName = '';
        let id = '';
        if (typeof selector === 'string') {
          const finalTerm = selector.replace(/^.+\s/, '');
          if (finalTerm.includes('#')) {
            const finalArray = finalTerm.split('#');
            tagName = finalArray[0].replace(/:.*/, '');
            id = finalArray[1];
          }
          else {
            tagName = finalTerm.replace(/:.*/, '');
          }
        }
        const instance = {
          ruleID,
          what: category.items[ruleID].description,
          ordinalSeverity,
          tagName,
          id,
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
  // Prevention.
  if (result.prevented) {
    standardResult.prevented = true;
  }
  // alfa
  else if (toolName === 'alfa' && result.totals) {
    standardResult.totals = [result.totals.warnings, 0, 0, result.totals.failures];
    result.items.forEach(item => {
      const {codeLines} = item.target;
      const code = Array.isArray(codeLines) ? codeLines.join(' ') : '';
      const identifiers = getIdentifiers(code);
      const tagNameArray = item.target
      && item.target.path
      && item.target.path.match(/^.*\/([a-z]+)\[\d+\]/);
      if (tagNameArray && tagNameArray.length === 2) {
        identifiers[0] = tagNameArray[1].toUpperCase();
      }
      const {rule, target} = item;
      const instance = {
        ruleID: rule.ruleID,
        what: rule.ruleSummary,
        ordinalSeverity: ['cantTell', '', '', 'failed'].indexOf(item.verdict),
        tagName: identifiers[0],
        id: identifiers[1],
        location: {
          doc: 'dom',
          type: 'xpath',
          spec: target.path
        },
        excerpt: cap(code)
      };
      standardResult.instances.push(instance);
    });
  }
  // aslint
  else if (toolName === 'aslint' && result.summary && result.summary.byIssueType) {
    standardResult.totals = [
      result.summary.byIssueType.warning, 0, 0, result.summary.byIssueType.error
    ];
    Object.keys(result.rules).forEach(ruleID => {
      const ruleResults = result.rules[ruleID].results;
      if (ruleResults && ruleResults.length) {
        ruleResults.forEach(ruleResult => {
          const what = ruleResult.message.actual.description;
          const {issueType} = result.rules[ruleID];
          const xpath = ruleResult.element && ruleResult.element.xpath || '';
          const tagName = xpath && xpath.replace(/^.*\//, '').replace(/[^-\w].*$/, '').toUpperCase()
          || '';
          const excerpt = ruleResult.element && ruleResult.element.html || '';
          const idDraft = excerpt && excerpt.replace(/^[^[>]+id="/, 'id=').replace(/".*$/, '');
          const id = idDraft && idDraft.length > 3 && idDraft.startsWith('id=')
            ? idDraft.slice(3)
            : '';
          const ruleData = aslintData[ruleID];
          if (ruleData) {
            const changer = ruleData.find(
              specs => specs.slice(0, -1).every(matcher => what.includes(matcher))
            );
            if (changer) {
              ruleID = changer[1];
            }
          }
          const instance = {
            ruleID,
            what,
            ordinalSeverity: ['warning', 0, 0, 'error'].indexOf(issueType),
            tagName,
            id,
            location: {
              doc: 'dom',
              type: 'xpath',
              spec: xpath
            },
            excerpt
          };
          standardResult.instances.push(instance);
        });
      }
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
    if (result.items) {
      result.items.forEach(item => {
        const identifiers = getIdentifiers(item.snippet);
        if (! identifiers[0] && item.path && item.path.dom) {
          const tagNameArray = item.path.dom.match(/^.+\/([^/[]+)/s);
          if (tagNameArray && tagNameArray.length === 2) {
            identifiers[0] = tagNameArray[1].toUpperCase();
          }
        }
        const instance = {
          ruleID: item.ruleId,
          what: item.message,
          ordinalSeverity: ['', 'recommendation', '', 'violation'].indexOf(item.level),
          tagName: identifiers[0],
          id: identifiers[1],
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
  // testaro
  else if (toolName === 'testaro') {
    const rules = result.rules ? Object.keys(result.rules) : [];
    standardResult.totals = [0, 0, 0, 0];
    rules.forEach(rule => {
      const ruleResult = result.rules[rule];
      standardResult.totals.forEach((total, index) => {
        standardResult.totals[index] += ruleResult
        && ruleResult.totals ? ruleResult.totals[index] || 0 : 0;
      });
      if (ruleResult.standardInstances) {
        standardResult.instances.push(... ruleResult.standardInstances);
      }
      else {
        console.log(`ERROR: Testaro rule ${rule} result has no standardInstances property`);
      }
    });
    const preventionCount = result.preventions && result.preventions.length;
    if (preventionCount) {
      standardResult.totals[3] += preventionCount;
      standardResult.instances.push({
        ruleID: 'testPrevention',
        what: 'Page prevented tests from being performed',
        ordinalSeverity: 3,
        count: preventionCount,
        tagName: '',
        id: '',
        location: '',
        excerpt: ''
      });
    }
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
  // Any tool with no reported rule violations:
  else {
    standardResult.totals = [0, 0, 0, 0];
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
