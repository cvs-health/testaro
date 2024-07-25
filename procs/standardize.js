/*
  © 2023–2024 CVS Health and/or one of its affiliates. All rights reserved.

  MIT License

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  standardize.js
  Converts test results to the standard format.
*/

// ########## FUNCTIONS

// Limits the length of and unilinearizes a string.
const cap = rawString => {
  const string = (rawString || '').replace(/[\s\u2028\u2029]+/g, ' ');
  if (string && string.length > 600) {
    return `${string.slice(0, 300)} … ${string.slice(-300)}`;
  }
  else if (string) {
    return string;
  }
  else {
    return '';
  }
};
// Returns whether an id attribute value is valid without character escaping.
const isBadID = id => /[^-\w]|^\d|^--|^-\d/.test(id);
// Returns the tag name and the value of an id attribute from a substring of HTML code.
const getIdentifiers = code => {
  let tagName = '';
  let id = '';
  // If the substring includes the start tag of an element:
  if (code && typeof code === 'string' && code.length && /<\s*[a-zA-Z]/.test(code)) {
    // Get the first start tag in the substring.
    const startTag = code.replace(/^.*?<(?=[a-zA-Z])/s, '').replace(/[^a-zA-Z0-9].*$/s, '').trim();
    // If it exists:
    if (startTag && startTag.length) {
      // Get its tag name, upper-cased.
      tagName = startTag.replace(/\s.*$/s, '').toUpperCase();
      // Get the value of the id attribute of the start tag, if any.
      const idArray = startTag.match(/\sid="([^"<>]+)"/);
      if (idArray && idArray.length === 2) {
        id = idArray[1];
      }
      // If the id value is invalid without character escaping:
      if (isBadID(id)) {
        // Remove it.
        id = '';
      }
    }
  }
  return [tagName, id];
};
/*
  Differentiates some rule IDs of aslint.
  If the purported rule ID is a key and the what property contains all of the strings except the
  last of any array item of the value of that key, then the final rule ID is the last item of that
  array item.
*/
const aslintData = {
  'misused_required_attribute': [
    ['not needed', 'misused_required_attributeR']
  ],
  'accessible_svg': [
    ['associated', 'accessible_svgI'],
    ['tabindex', 'accessible_svgT']
  ],
  'audio_alternative': [
    ['track', 'audio_alternativeT'],
    ['alternative', 'audio_alternativeA'],
    ['bgsound', 'audio_alternativeB']
  ],
  'table_missing_description': [
    ['describedby', 'associated', 'table_missing_descriptionDM'],
    ['labeledby', 'associated', 'table_missing_descriptionLM'],
    ['caption', 'not been defined', 'table_missing_descriptionC'],
    ['summary', 'empty', 'table_missing_descriptionS'],
    ['describedby', 'empty', 'table_missing_descriptionDE'],
    ['labeledby', 'empty', 'table_missing_descriptionLE'],
    ['caption', 'no content', 'table_missing_descriptionE']
  ],
  'label_implicitly_associated': [
    ['only whice spaces', 'label_implicitly_associatedW'],
    ['more than one', 'label_implicitly_associatedM']
  ],
  'label_inappropriate_association': [
    ['Missing', 'label_inappropriate_associationM'],
    ['non-form', 'label_inappropriate_associationN']
  ],
  'table_row_and_column_headers': [
    ['headers', 'table_row_and_column_headersRC'],
    ['Content', 'table_row_and_column_headersB'],
    ['head of the columns', 'table_row_and_column_headersH']
  ],
  'color_contrast_state_pseudo_classes_abstract': [
    ['position: fixed', 'color_contrast_state_pseudo_classes_abstractF'],
    ['transparent', 'color_contrast_state_pseudo_classes_abstractB'],
    ['least 3:1', 'color_contrast_state_pseudo_classes_abstract3'],
    ['least 4.5:1', 'color_contrast_state_pseudo_classes_abstract4']
  ],
  'color_contrast_state_pseudo_classes_active': [
    ['position: fixed', 'color_contrast_state_pseudo_classes_abstractF'],
    ['transparent', 'color_contrast_state_pseudo_classes_abstractB'],
    ['least 3:1', 'color_contrast_state_pseudo_classes_abstract3'],
    ['least 4.5:1', 'color_contrast_state_pseudo_classes_abstract4']
  ],
  'color_contrast_state_pseudo_classes_focus': [
    ['position: fixed', 'color_contrast_state_pseudo_classes_abstractF'],
    ['transparent', 'color_contrast_state_pseudo_classes_abstractB'],
    ['least 3:1', 'color_contrast_state_pseudo_classes_abstract3'],
    ['least 4.5:1', 'color_contrast_state_pseudo_classes_abstract4']
  ],
  'color_contrast_state_pseudo_classes_hover': [
    ['position: fixed', 'color_contrast_state_pseudo_classes_abstractF'],
    ['transparent', 'color_contrast_state_pseudo_classes_abstractB'],
    ['least 3:1', 'color_contrast_state_pseudo_classes_abstract3'],
    ['least 4.5:1', 'color_contrast_state_pseudo_classes_abstract4']
  ],
  'color_contrast_aaa': [
    ['transparent', 'color_contrast_aaaB'],
    ['least 4.5:1', 'color_contrast_aaa4'],
    ['least 7:1', 'color_contrast_aaa7']
  ],
  'animation': [
    ['duration', 'animationD'],
    ['iteration', 'animationI'],
    ['mechanism', 'animationM']
  ],
  'page_title': [
    ['empty', 'page_titleN'],
    ['not identify', 'page_titleU']
  ],
  'aria_labelledby_association': [
    ['exist', 'aria_labelledby_associationN'],
    ['empty', 'aria_labelledby_associationE']
  ],
  'html_lang_attr': [
    ['parameters', 'html_lang_attrP'],
    ['nothing', 'html_lang_attrN'],
    ['empty', 'html_lang_attrE']
  ],
  'missing_label': [
    ['associated', 'missing_labelI'],
    ['defined', 'missing_labelN'],
    ['multiple labels', 'missing_labelM']
  ],
  'orientation': [
    ['loaded', 'orientationT']
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
            id: isBadID(id.slice(1)) ? '' : id.slice(1),
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
        if (tagNameLCArray && tagNameLCArray[1]) {
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
          spec: item && item.lastLine && item.lastLine.toString() || ''
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
            ordinalSeverity: severities[ruleClassName][item.verdict] || 0,
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
            id = isBadID(finalArray[1]) ? '' : finalArray[1];
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
const convert = (toolName, data, result, standardResult) => {
  // Prevention.
  if (data.prevented) {
    standardResult.prevented = true;
  }
  // alfa
  else if (toolName === 'alfa' && result.totals) {
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
      let instance;
      if (item.verdict === 'failed') {
        instance = {
          ruleID: rule.ruleID,
          what: rule.ruleSummary,
          ordinalSeverity: 3,
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
      }
      else if (item.verdict === 'cantTell') {
        if (['r66', 'r69'].includes(rule.ruleID)) {
          instance = {
            ruleID: 'cantTellTextContrast',
            what: `cannot test for rule ${rule.ruleID}: ${rule.ruleSummary}`,
            ordinalSeverity: 0,
            tagName: identifiers[0],
            id: identifiers[1],
            location: {
              doc: 'dom',
              type: 'xpath',
              spec: target.path
            },
            excerpt: cap(code)
          };
        }
        else {
          instance = {
            ruleID: 'cantTell',
            what: `cannot test for rule ${rule.ruleID}: ${rule.ruleSummary}`,
            ordinalSeverity: 0,
            tagName: identifiers[0],
            id: identifiers[1],
            location: {
              doc: 'dom',
              type: 'xpath',
              spec: target.path
            },
            excerpt: cap(code)
          };
        }
        standardResult.instances.push(instance);
      }
    });
  }
  // aslint
  else if (toolName === 'aslint' && result.summary && result.summary.byIssueType) {
    // For each rule:
    Object.keys(result.rules).forEach(ruleID => {
      // If it has a valid issue type:
      const {issueType} = result.rules[ruleID];
      if (issueType && ['warning', 'error'].includes(issueType)) {
        // If there are any violations:
        const ruleResults = result.rules[ruleID].results;
        if (ruleResults && ruleResults.length) {
          // For each violation:
          ruleResults.forEach(ruleResult => {
            // If it has a description:
            if (
              ruleResult.message
              && ruleResult.message.actual
              && ruleResult.message.actual.description
            ) {
              const what = ruleResult.message.actual.description;
              // Get the differentiated ID of the rule if any.
              const ruleData = aslintData[ruleID];
              let finalRuleID = ruleID;
              if (ruleData) {
                const changer = ruleData.find(
                  specs => specs.slice(0, -1).every(matcher => what.includes(matcher))
                );
                if (changer) {
                  finalRuleID = changer[changer.length - 1];
                }
              }
              // Get the instance properties.
              const xpath = ruleResult.element && ruleResult.element.xpath || '';
              let tagName = xpath
              && xpath.replace(/^.*\//, '').replace(/[^-\w].*$/, '').toUpperCase()
              || '';
              if (! tagName && finalRuleID.endsWith('_svg')) {
                tagName = 'SVG';
              }
              const excerpt = ruleResult.element && ruleResult.element.html.replace(/\s+/g, ' ')
              || '';
              if (! tagName && /^<[a-z]+[ >]/.test(excerpt)) {
                tagName = excerpt.slice(1).replace(/[ >].+/, '').toUpperCase();
              }
              const idDraft = excerpt && excerpt.replace(/^[^[>]+id="/, 'id=').replace(/".*$/, '');
              const idFinal = idDraft && idDraft.length > 3 && idDraft.startsWith('id=')
                ? idDraft.slice(3)
                : '';
              const id = idFinal === '' || isBadID(idFinal) ? '' : idFinal;
              const instance = {
                ruleID: finalRuleID,
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
            }
          });
        }
      }
    });
  }
  // axe
  else if (
    toolName === 'axe'
    && result
    && result.totals
    && (result.totals.rulesWarned || result.totals.rulesViolated)
  ) {
    doAxe(result, standardResult, 'incomplete');
    doAxe(result, standardResult, 'violations');
  }
  // ed11y
  else if (
    toolName === 'ed11y'
    && result
    && ['imageAlts', 'violations', 'errorCount', 'warningCount']
    .every(key => result[key] !== undefined)
  ) {
    // For each violation:
    result.violations.forEach(violation => {
      const {test, content, tagName, id, loc, excerpt, boxID, pathID} = violation;
      if (['test', 'content'].every(key => key)) {
        // Standardize the what property.
        let what = '';
        if (content.includes('<p>This')) {
          what = content.replace(/^.*?<p>(This.+?)<\/p> *<p>(.*?)<\/p>.*/, '$1 $2');
        }
        else {
          what = content.replace(/^.*?<p>(.+?)<\/p>.*/, '$1');
        }
        // Add a standard instance to the standard result.
        standardResult.instances.push({
          ruleID: test,
          what,
          ordinalSeverity: 0,
          tagName,
          id: isBadID(id) ? '' : id,
          location: {
            doc: 'dom',
            type: 'box',
            spec: loc
          },
          excerpt,
          boxID,
          pathID
        });
      }
    });
  }
  // htmlcs
  else if (toolName === 'htmlcs' && result) {
    doHTMLCS(result, standardResult, 'Warning');
    doHTMLCS(result, standardResult, 'Error');
  }
  // ibm
  else if (toolName === 'ibm' && result.totals) {
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
    // Initialize a record of sample-ratio-weighted totals.
    data.ruleTotals = {};
    // For each violated rule:
    const rules = result ? Object.keys(result) : [];
    rules.forEach(rule => {
      // Copy its instances to the standard result.
      const ruleResult = result[rule];
      if (ruleResult.standardInstances) {
        standardResult.instances.push(... ruleResult.standardInstances);
      }
      else {
        console.log(`ERROR: Testaro rule ${rule} result has no standardInstances property`);
      }
      // Initialize a record of its sample-ratio-weighted totals.
      data.ruleTotals[rule] = [0, 0, 0, 0];
      // Add those totals to the record and to the standard result.
      if (ruleResult.totals) {
        for (const index in ruleResult.totals) {
          const ruleTotal = ruleResult.totals[index];
          data.ruleTotals[rule][index] += ruleTotal;
          standardResult.totals[index] += ruleTotal;
        }
      }
      else {
        console.log(`ERROR: Testaro rule ${rule} result has no totals property`);
      }
    });
    const preventionCount = result.preventions && result.preventions.length;
    if (preventionCount) {
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
  }
  // wax
  else if (toolName === 'wax' && result.violations && result.violations.length) {
    // For each violation:
    result.violations.forEach(violation => {
      // Get its standard instance properties.
      const element = violation.element.replace(/\s+/g, ' ');
      const {message, description, severity} = violation;
      const ordinalSeverity = ['Minor', 'Moderate', '', 'Severe'].indexOf(severity);
      const tagNameCandidate = element.replace(/^<| .*$/g, '');
      const tagName = /^[a-zA-Z0-9]+$/.test(tagNameCandidate) ? tagNameCandidate.toUpperCase() : '';
      let id = '';
      const location = {};
      if (tagName) {
        const idTerm = element
        .replace(/>.*$/, '')
        .split(' ')
        .slice(1)
        .find(term => term.startsWith('id="'));
        if (idTerm) {
          const idCandidate = idTerm.slice(4, -1);
          if (! idCandidate.includes('"')) {
            id = idCandidate;
            location.doc = 'dom';
            location.type = 'selector';
            location.spec = `#${id}`;
          }
        }
      }
      const instance = {
        ruleID: message,
        what: description,
        ordinalSeverity,
        tagName,
        id,
        location,
        excerpt: element
      };
      // Add the instance to the standard result.
      standardResult.instances.push(instance);
    });
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
    ['error', 'contrast', 'alert'].forEach(categoryName => {
      doWAVE(result, standardResult, categoryName);
    });
  }
  // Populate the totals of the standard result if the tool is not Testaro.
  if (toolName !== 'testaro') {
    standardResult.instances.forEach(instance => {
      standardResult.totals[instance.ordinalSeverity] += instance.count || 1;
    });
  }
  // Round the totals of the standard result.
  standardResult.totals = standardResult.totals.map(total => Math.round(total));
};
// Converts the results.
exports.standardize = act => {
  const {which, data, result, standardResult} = act;
  if (which && result && standardResult) {
    convert(which, data, result, standardResult);
  }
  else {
    console.log('ERROR: Result of incomplete act cannot be standardized');
  }
};
