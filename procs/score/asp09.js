/*
  asp09
  Autotest score proc 9
  Computes and reports a score from 5 packages and 16 custom tests, with discounts.
*/
exports.scorer = acts => {
  // CONSTANTS
  // Define the configuration disclosures.
  const logWeights = {
    count: 0.5,
    size: 0.01,
    prohibited: 15,
    visitTimeout: 10,
    visitRejection: 10
  };
  const rules = {
    aatt: '',
    alfa:'',
    axe: '',
    bulk: '',
    embAc: '',
    focAll: '',
    focInd: '',
    focOp: '',
    hover: '',
    ibm: '',
    labClash: '',
    linkUl: '',
    log: 'multiply log items by respective logWeights; sum',
    menuNav: '',
    motion: '',
    radioSet: '',
    role: '',
    styleDiff: '',
    tabNav: '',
    wave: '',
    zIndex: ''
  };
  let duplications = {};
  const diffStyles = [
    'borderStyle',
    'borderWidth',
    'fontStyle',
    'fontWeight',
    'lineHeight',
    'maxHeight',
    'maxWidth',
    'minHeight',
    'minWidth',
    'opacity',
    'outlineOffset',
    'outlineStyle',
    'outlineWidth',
    'textDecorationLine',
    'textDecorationStyle',
    'textDecorationThickness'
  ];
  // Initialize the score.
  const inferences = {};
  let scores = {
    total: 0,
    aatt: null,
    alfa: null,
    axe: null,
    bulk: null,
    embAc: null,
    focAll: null,
    focInd: null,
    focOp: null,
    hover: null,
    ibm: null,
    labClash: null,
    linkUl: null,
    log: null,
    menuNav: null,
    motion: null,
    radioSet: null,
    role: null,
    styleDiff: null,
    tabNav: null,
    wave: null,
    zIndex: null
  };
  // VARIABLES
  let facts;
  // If there are any acts:
  if (Array.isArray(acts)) {
    // If any of them are tests:
    const tests = acts.filter(act => act.type === 'test');
    if (tests.length) {
      // CONSTANTS
      // Empirically derived counts of duplications of package rules.
      duplications = {
        'aatt': {
          'e:F77': 1,
          'e:H36': 4,
          'e:H37': 2,
          'e:H57': 3,
          'e:H58': 2,
          'w:G141': 3,
          'w:H98': 1,
          'e:ARIA6+H53': 1,
          'e:H24': 2,
          'e:G1+G123+G124': 1,
          'w:G90': 1,
          'w:H44': 1
        },
        'alfa': {
          'r3': 2,
          'r28': 4,
          'r2': 2,
          'r4': 3,
          'r7': 2,
          'r53': 3,
          'r10': 1,
          'r11': 1,
          'r12': 2,
          'r20': 1,
          'r42': 1,
          'r43': 1,
          'r47': 1,
          'r5': 2,
          'r68': 1,
          'r93': 1,
          'r13': 1
        },
        'axe': {
          'input-image-alt': 4,
          'html-has-lang': 3,
          'valid-lang': 2,
          'heading-order': 3,
          'link-name': 2,
          'aria-command-name': 2,
          'dlitem': 1,
          'image-alt': 2,
          'duplicate-id': 1,
          'aria-required-parent': 1,
          'svg-img-alt': 1,
          'meta-viewport': 1,
          'html-lang-valid': 2,
          'aria-required-children': 1,
          'avoid-inline-spacing': 1,
          'area-alt': 2,
          'aria-allowed-role': 1,
          'aria-required-attr': 1,
          'aria-valid-attr': 1,
          'autocomplete-valid': 1,
          'color-contrast': 1,
          'empty-heading': 2,
          'frame-title': 1,
          'image-redundant-alt': 1,
          'landmark-complementary-is-top-level': 2,
          'landmark-no-duplicate-banner': 1,
          'landmark-no-duplicate-main': 2,
          'document-title': 1,
          'object-alt': 1,
          'page-has-heading-one': 1,
          'select-name': 1
        },
        'ibm': {
          'v:WCAG20_Object_HasText': 1,
          'v:WCAG20_Area_HasAlt': 2,
          'v:WCAG20_Input_ExplicitLabelImage': 4,
          'v:WCAG20_Frame_HasTitle': 2,
          'v:WCAG20_Elem_Lang_Valid': 2,
          'v:HAAC_Img_UsemapAlt': 1,
          'v:aria_semantics_role': 1,
          'v:Rpt_Aria_RequiredProperties': 1,
          'v:Rpt_Aria_ValidProperty': 1,
          'v:WCAG21_Input_Autocomplete': 1,
          'v:IBMA_Color_Contrast_WCAG2AA': 2,
          'v:RPT_Header_HasContent': 2,
          'v:WCAG20_Img_HasAlt': 2,
          'v:WCAG20_Img_LinkTextNotRedundant': 1,
          'v:Rpt_Aria_ComplementaryRequiredLabel_Implicit': 1,
          'v:Rpt_Aria_MultipleComplementaryLandmarks_Implicit': 1,
          'v:Rpt_Aria_MultipleBannerLandmarks_Implicit': 1,
          'r:Rpt_Aria_MultipleMainsVisibleLabel_Implicit': 1,
          'v:Rpt_Aria_MultipleMainsRequireLabel_Implicit_2': 1,
          'v:WCAG20_A_HasText': 1,
          'v:Rpt_Aria_ValidIdRef': 1,
          'v:WCAG20_Elem_UniqueAccessKey': 1,
          'v:WCAG20_Input_RadioChkInFieldSet': 1
        },
        'wave': {
          'a:link_internal_broken': 1,
          'e:alt_area_missing': 3,
          'e:alt_input_missing': 4,
          'e:alt_missing': 2,
          'e:language_missing': 3,
          'a:heading_skipped': 3,
          'a:event_handler': 1,
          'a:label_orphaned': 1,
          'e:title_invalid': 1,
          'e:heading_empty': 2,
          'a:plugin': 1,
          'a:h1_missing': 1,
          'a:select_missing_label': 1,
          'c:contrast': 1,
          'e:aria_reference_broken': 1,
          'a:accesskey': 1,
          'a:fieldset_missing': 1
        }
      };
      // FUNCTIONS
      // Adds the actual or inferred score of a test to the total score.
      const increment = test => {
        scores.total += typeof scores[test] === 'number' ? scores[test] : inferences[test];
      };
      // OPERATION
      // For each test:
      tests.forEach(test => {
        const {which} = test;
        // Compute its score.
        if (which === 'alfa') {
          facts = test.result;
          if (facts && Array.isArray(facts)) {
            rules.alfa = 'multiply cantTell by 2*, failed by 4* (*discounted); sum';
            scores.alfa = Math.round(facts.reduce((total, issue) => {
              const rawScore = [4, 2][['failed', 'cantTell'].indexOf(issue.verdict)] || 0;
              const divisor = duplications.alfa[issue.rule.ruleID] + 1 || 1;
              return total + rawScore / divisor;
            }, 0));
            scores.total += scores.alfa;
          }
        }
        else if (which === 'aatt') {
          facts = test.result;
          if (facts && Array.isArray(facts)) {
            rules.aatt = 'multiply warning by 2*, error by 4* (*discounted); sum';
            const issues = facts.filter(fact => fact.type);
            scores.aatt = Math.round(issues.reduce((total, issue) => {
              const rawScore = [4, 2][['error', 'warning'].indexOf(issue.type)] || 0;
              const divisor = duplications.aatt[`${issue.type.slice(0, 1)}:${issue.id}`] + 1 || 1;
              return total + rawScore / divisor;
            }, 0));
            scores.total += scores.aatt;
          }
        }
        else if (which === 'axe') {
          facts = test.result && test.result.items;
          if (facts) {
            rules.axe = 'multiply minor by 2*, moderate by 3*, serious by 4*, critical by 5* (*discounted); sum';
            scores.axe = Math.round(facts.reduce((total, item) => {
              const rawScore = item.elements.length * (
                [5, 4, 3, 2][['critical', 'serious', 'moderate', 'minor'].indexOf(item.impact)] || 0
              );
              const divisor = duplications.axe[item.rule] + 1 || 1;
              return total + rawScore / divisor;
            }, 0));
            scores.total += scores.axe;
          }
        }
        else if (which === 'ibm') {
          facts = test.result;
          if (facts && facts.content && facts.url && (facts.content.totals || facts.url.totals)) {
            rules.ibm = 'multiply violations by 4*, recommendations by 2* (*discounted); sum';
            const ibmScores = {
              content: null,
              url: null
            };
            ['content', 'url'].forEach(type => {
              const totals = facts[type].totals;
              if (totals) {
                const items = facts[type].items || [];
                ibmScores[type] = Math.round(items.reduce((total, item) => {
                  const {ruleId, level} = item;
                  const rawScore = [4, 2][['violation', 'recommendation'].indexOf(level)] || 0;
                  const divisor = duplications.ibm[`${level.slice(0, 1)}:${ruleId}`] + 1 || 1;
                  return total + rawScore / divisor;
                }, 0));
              }
            });
            if (ibmScores.content !== null || ibmScores.url !== null) {
              scores.ibm = Math.max(ibmScores.content || 0, ibmScores.url || 0);
              scores.total += scores.ibm;
            }
          }
        }
        else if (which === 'wave') {
          facts = test.result && test.result.categories;
          if (facts) {
            rules.wave
              = 'multiply alerts by 2*, contrast errors by 3*, errors by 4* (*discounted); sum';
            const weights = {
              error: 4,
              contrast: 3,
              alert: 2
            };
            const waveScores = {
              error: 0,
              contrast: 0,
              alert: 0
            };
            ['error', 'contrast', 'alert'].forEach(level => {
              const {items} = facts[level];
              waveScores[level] = Math.round(Object.keys(items).reduce((total, ruleID) => {
                const rawScore = items[ruleID].count * weights[level];
                const divisor = duplications.wave[`${level.slice(0, 1)}:${ruleID}`] + 1 || 1;
                return total + rawScore / divisor;
              }, 0));
            });
            scores.wave = waveScores.error + waveScores.contrast + waveScores.alert;
            scores.total += scores.wave;
          }
        }
        else if (which === 'bulk') {
          facts = test.result && test.result.visibleElements;
          if (typeof facts === 'number') {
            rules.bulk = 'subtract 250 from visible elements; make 0 if negative; raise to 0.9th power; multiply by 0.15';
            // Deficit: 15% of the excess, to the 0.9th power, of the element count over 250.
            scores.bulk = Math.floor(0.15 * Math.pow(Math.max(0, facts - 250), 0.9));
          }
          else {
            inferences.bulk = 100;
          }
          increment('bulk');
        }
        else if (which === 'embAc') {
          facts = test.result && test.result.totals;
          if (facts) {
            rules.embAc = 'multiply link- or button-contained links, buttons, inputs, and selects by 3 (discounted)';
            scores.embAc = 3 * (facts.links + facts.buttons + facts.inputs + facts.selects);
          }
          else {
            inferences.embAc = 150;
          }
          increment('embAc');
        }
        else if (which === 'focAll') {
          facts = test.result;
          if (facts && typeof facts === 'object') {
            rules.focAll= 'multiply discrepancy between focusable and focused element counts by 3';
            scores.focAll = 3 * Math.abs(facts.discrepancy);
          }
          else {
            inferences.focAll = 150;
          }
          increment('focAll');
        }
        else if (which === 'focInd') {
          facts = test.result && test.result.totals;
          facts = facts ? facts.types : null;
          if (facts) {
            rules.focInd = 'multiply indicatorless-when-focused elements by 5';
            scores.focInd = 5 * facts.indicatorMissing.total + 3 * facts.nonOutlinePresent.total;
          }
          else {
            inferences.focInd = 150;
          }
          increment('focInd');
        }
        else if (which === 'focOl') {
          facts = test.result && test.result.totals;
          facts = facts ? facts.types : null;
          facts = facts ? facts.outlineMissing : null;
          if (facts) {
            rules.focOl = 'multiply non-outline focus indicators by 3, missing focus indicators by 5; sum';
            scores.focOl = 3 * facts.total;
          }
          else {
            inferences.focOl = 100;
          }
          increment('focOl');
        }
        else if (which === 'focOp') {
          facts = test.result && test.result.totals;
          if (facts) {
            rules.focOp = 'multiply nonfocusable operable elements by 4, nonoperable focusable by 1; sum';
            scores.focOp
              = 4 * facts.types.onlyOperable.total + 1 * facts.types.onlyFocusable.total;
          }
          else {
            inferences.focOp = 150;
          }
          increment('focOp');
        }
        else if (which === 'hover') {
          facts = test.result && test.result.totals;
          if (facts) {
            rules.hover = 'multiply elements changing page on hover by 4, made visible by 2, with directly changed opacity by 0.1, with indirectly changed opacity by 0.2, unhoverable by 2; sum';
            scores.hover
              = 4 * facts.triggers
              + 2 * facts.madeVisible
              + Math.floor(0.1 * facts.opacityChanged)
              + Math.floor(0.2 * facts.opacityAffected)
              + 2 * facts.unhoverables;
          }
          else {
            inferences.hover = 150;
          }
          increment('hover');
        }
        else if (which === 'labClash') {
          facts = test.result && test.result.totals;
          if (facts) {
            rules.labClash = 'multiply conflictually labeled elements by 2, unlabeled elements by 2; sum';
            // Unlabeled elements discounted.
            scores.labClash = 2 * facts.mislabeled + 2 * facts.unlabeled;
          }
          else {
            inferences.labClash = 100;
          }
          increment('labClash');
        }
        else if (which === 'linkUl') {
          facts = test.result && test.result.totals;
          facts = facts ? facts.inline : null;
          if (facts) {
            rules.linkUl = 'multiply nonunderlined inline links by 3';
            scores.linkUl = 3 * (facts.total - facts.underlined);
          }
          else {
            inferences.linkUl = 150;
          }
          increment('linkUl');
        }
        else if (which === 'menuNav') {
          facts = test.result && test.result.totals && test.result.totals.navigations;
          if (facts) {
            rules.menuNav = 'multiply Home and End errors by 1 and other key-navigation errors by 3; sum';
            scores.menuNav
              = 3 * facts.all.incorrect
              - 2 * (facts.specific.home.incorrect + facts.specific.end.incorrect);
          }
          else {
            inferences.menuNav = 150;
          }
          increment('menuNav');
        }
        else if (which === 'motion') {
          facts = test.result;
          if (facts && facts.bytes) {
            rules.motion = 'get PNG screenshot sizes (sss); get differing-pixel counts between adjacent PNG screenshots (pd); “sssd” = sss difference ÷ smaller sss - 1; multiply mean adjacent sssd by 5, maximum adjacent sssd by 2, maximum over-all ssd by 1; divide mean pd by 10,000, maximum pd by 25,000; multiply count of non-0 pd by 30; sum';
            scores.motion = Math.floor(
              5 * (facts.meanLocalRatio - 1)
              + 2 * (facts.maxLocalRatio - 1)
              + facts.globalRatio - 1
              + facts.meanPixelChange / 10000
              + facts.maxPixelChange / 25000
              + 30 * facts.changeFrequency
            );
          }
          else {
            inferences.motion = 150;
          }
          increment('motion');
        }
        else if (which === 'radioSet') {
          facts = test.result && test.result.totals;
          if (facts) {
            rules.radioSet = 'multiply radio buttons not in fieldsets with legends and no other-name radio buttons by 2';
            // Defects discounted.
            scores.radioSet = 2 * (facts.total - facts.inSet);
          }
          else {
            inferences.radioSet = 100;
          }
          increment('radioSet');
        }
        else if (which === 'role') {
          facts = test.result && test.result.badRoleElements;
          if (typeof facts === 'number') {
            rules.role = 'multiple role attributes with invalid or native-HTML-equivalent values by 2';
            // Defects discounted.
            scores.role = 2 * facts;
          }
          else {
            inferences.role = 100;
          }
          increment('role');
        }
        else if (which === 'styleDiff') {
          facts = test.result && test.result.totals;
          if (facts) {
            rules.styleDiff = 'for each of element classes block a, inline a, button, h1, h2, h3, h4, h5, and h6, get diffStyles-distinct styles; multiply their count minus 1 by 2; multiply count of elements with non-plurality styles by 0.2; sum';
            // Identify objects having the tag-name totals and style distributions as properties.
            const tagNameCounts = Object.values(facts);
            // Identify an array of pairs of counts of excess styles and nonplurality elements.
            const deficits = tagNameCounts.map(
              item => {
                const subtotals = item.subtotals ? item.subtotals : [item.total];
                return [subtotals.length - 1, item.total - subtotals[0]];
              }
            );
            // Deficit: 2 per excess style + 0.2 per nonplurality element.
            scores.styleDiff = Math.floor(deficits.reduce(
              (total, currentPair) => total + 2 * currentPair[0] + 0.2 * currentPair[1], 0
            ));
          }
          else {
            inferences.styleDiff = 100;
          }
          increment('styleDiff');
        }
        else if (which === 'tabNav') {
          facts = test.result && test.result.totals && test.result.totals.navigations;
          if (facts) {
            rules.tabNav = 'multiply Home and End errors by 1 and other key-navigation errors by 3; sum';
            scores.tabNav
              = 3 * facts.all.incorrect
              - 2 * (facts.specific.home.incorrect + facts.specific.end.incorrect);
          }
          else {
            inferences.tabNav = 150;
          }
          increment('tabNav');
        }
        else if (which === 'zIndex') {
          facts = test.result && test.result.totals;
          if (facts) {
            rules.zIndex = 'multiply non-auto z indexes by 3';
            scores.zIndex = 3 * facts.total;
          }
          else {
            inferences.zIndex = 100;
          }
          increment('zIndex');
        }
      });
      // Compute the inferred scores of package tests that failed and adjust the total score.
      const estimate = (tests, penalty) => {
        const packageScores = tests.map(test => scores[test]).filter(score => score !== null);
        const scoreCount = packageScores.length;
        let meanScore;
        if (scoreCount) {
          meanScore = Math.floor(
            packageScores.reduce((sum, current) => sum + current) / packageScores.length
          );
        }
        else {
          meanScore = 100;
        }
        tests.forEach(test => {
          if (scores[test] === null) {
            inferences[test] = meanScore + penalty;
            scores.total += inferences[test];
          }
        });
      };
      estimate(['alfa', 'aatt', 'axe', 'ibm', 'wave'], 100);
    }
  }
  // Return the score facts, except for the log test.
  return {
    scoreProc: 'asp',
    version: '9',
    duplications,
    rules,
    diffStyles,
    logWeights,
    inferences,
    scores
  };
};
