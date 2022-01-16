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
  const ruleDiscounts = {};
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
  let deficit = {
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
      // Discounts from deficit scores based on multi-test reporting of the same faults.
      ruleDiscounts.aatt = {
        'e:F77': 2,
        'e:G18': 2,
        'e:H91': 2,
        'w:F24': 1,
        'w:G18': 1,
        'w:H67': 2
      };
      ruleDiscounts.alfa = [
        'r2',
        'r3',
        'r4',
        'r5',
        'r11',
        'r12',
        'r52',
        'r56',
        'r57',
        'r58',
        'r68',
        'r69',
        'r88'
      ];
      ruleDiscounts.axe = {
        'aria-allowed-role': 1,
        'aria-roles': 2,
        'color-contrast': 2,
        'duplicate-id': 1,
        'httml-has-lang': 2,
        'html-lang-valid': 2,
        'image-alt': 2,
        'image-redundant-alt': 1,
        'label': 3,
        'link-name': 2,
        'nested-interactive': 2,
        'region': 1
      };
      ruleDiscounts.ibm = {
        'aria_semantics_role': 2,
        'IBMA_Color_Contrast_WCAG2AA': 2,
        'Rpt_Aria_OrphanedContent_Native_Host_Sematics': 2,
        'Rpt_Aria_ValidIdRef': 2,
        'Rpt_Aria_ValidRole': 2,
        'RPT_Elem_UniqueId': 2,
        'WCAG20_A_HasText': 2,
        'WCAG20_Fieldset_HasLegend': 3,
        'WCAG20_Input_ExplicitLabel': 2,
        'WCAG20_Input_RadioChkInFieldSet': 3
      };
      ruleDiscounts.wave = {
        'alt_redundant': 1,
        'aria_reference_broken': 2,
        'contrast': 1,
        'fieldset_missing': 1,
        'label_orphaned': 1,
        'legend_missing': 1,
        'link_empty': 2,
        'select_missing_label': 1
      };
      // FUNCTIONS
      // Adds the actual or inferred score of a test to the total score.
      const increment = test => {
        deficit.total += typeof deficit[test] === 'number' ? deficit[test] : inferences[test];
      };
      // For each test:
      tests.forEach(test => {
        const {which} = test;
        // Compute its score.
        if (which === 'alfa') {
          facts = test.result;
          if (facts && Array.isArray(facts)) {
            rules.alfa = 'multiply cantTell by 2, failed by 4; sum; subtract discounts';
            let totalDiscount = 0;
            facts.forEach(fact => {
              if (ruleDiscounts.alfa.includes(fact.rule.ruleID)) {
                const factDiscount = fact.verdict === 'failed' ? 2 : 1;
                totalDiscount += factDiscount;
              }
            });
            deficit.alfa
              = 2 * facts.filter(fact => fact.verdict === 'cantTell').length
              + 4 * facts.filter(fact => fact.verdict === 'failed').length
              - totalDiscount;
            deficit.total += deficit.alfa;
          }
        }
        else if (which === 'aatt') {
          facts = test.result;
          if (facts && Array.isArray(facts)) {
            rules.aatt = 'multiply warning by 2, error by 4; sum; subtract discounts';
            const issues = facts.filter(fact => fact.type);
            let totalDiscount = 0;
            issues.forEach(issue => {
              const issueDiscount = ruleDiscounts.aatt[`${issue.type.slice(0, 1)}:${issue.id}`];
              if (issueDiscount) {
                totalDiscount += issueDiscount;
              }
            });
            deficit.aatt
              = 2 * issues.filter(issue => issue.type === 'warning').length
              + 4 * issues.filter(issue => issue.type === 'error').length
              - totalDiscount;
            deficit.total += deficit.aatt;
          }
        }
        else if (which === 'axe') {
          facts = test.result && test.result.violations;
          if (facts) {
            rules.axe = 'multiply minor by 2, moderate by 3, serious by 4, critical by 5; sum; subtract discounts';
            const axeRules = test.result.items || [];
            let totalDiscount = 0;
            axeRules.forEach(rule => {
              const ruleDiscount = ruleDiscounts.axe[rule.rule];
              if (ruleDiscount) {
                totalDiscount += ruleDiscount * rule.elements.length;
              }
            });
            deficit.axe
              = 2 * facts.minor
              + 3 * facts.moderate
              + 4 * facts.serious
              + 5 * facts.critical
              - totalDiscount;
            deficit.total += deficit.axe;
          }
        }
        else if (which === 'ibm') {
          facts = test.result;
          if (facts && facts.content && facts.url && (facts.content.totals || facts.url.totals)) {
            rules.ibm = 'multiply violations by 4, recommendatons by 2; sum; subtract discounts';
            const scores = {
              content: null,
              url: null
            };
            ['content', 'url'].forEach(type => {
              const totals = facts[type].totals;
              if (totals) {
                const ibmRules = test.result[type].items || [];
                let totalDiscount = 0;
                ibmRules.forEach(rule => {
                  const ruleDiscount = ruleDiscounts.ibm[rule.ruleId];
                  if (ruleDiscount) {
                    totalDiscount += ruleDiscount;
                  }
                });
                scores[type] = 4 * totals.violation + 2 * totals.recommendation - totalDiscount;
              }
            });
            if (scores.content !== null || scores.url !== null) {
              deficit.ibm = Math.max(scores.content || 0, scores.url || 0);
              deficit.total += deficit.ibm;
            }
          }
        }
        else if (which === 'wave') {
          facts = test.result && test.result.categories;
          if (facts) {
            rules.wave = 'multiply alerts by 2, contrast errors by 3, errors by 4; sum; subtract discounts';
            let totalDiscount = 0;
            ['error', 'contrast', 'alert'].forEach(level => {
              const items = facts[level].items;
              const waveRules = Object.keys(items);
              waveRules.forEach(rule => {
                const ruleDiscount = ruleDiscounts.wave[rule] * items[rule].count;
                if (ruleDiscount) {
                  totalDiscount += ruleDiscount;
                }
              });
            });
            deficit.wave
              = 2 * facts.alert.count
              + 3 * facts.contrast.count
              + 4 * facts.error.count
              - totalDiscount;
            deficit.total += deficit.wave;
          }
        }
        else if (which === 'bulk') {
          facts = test.result && test.result.visibleElements;
          if (typeof facts === 'number') {
            rules.bulk = 'subtract 250 from visible elements; make 0 if negative; raise to 0.9th power; multiply by 0.15';
            // Deficit: 15% of the excess, to the 0.9th power, of the element count over 250.
            deficit.bulk = Math.floor(0.15 * Math.pow(Math.max(0, facts - 250), 0.9));
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
            deficit.embAc = 3 * (facts.links + facts.buttons + facts.inputs + facts.selects);
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
            deficit.focAll = 3 * Math.abs(facts.discrepancy);
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
            deficit.focInd = 5 * facts.indicatorMissing.total + 3 * facts.nonOutlinePresent.total;
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
            deficit.focOl = 3 * facts.total;
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
            deficit.focOp
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
            deficit.hover
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
            deficit.labClash = 2 * facts.mislabeled + 2 * facts.unlabeled;
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
            deficit.linkUl = 3 * (facts.total - facts.underlined);
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
            deficit.menuNav
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
            deficit.motion = Math.floor(
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
            deficit.radioSet = 2 * (facts.total - facts.inSet);
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
            deficit.role = 2 * facts;
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
            deficit.styleDiff = Math.floor(deficits.reduce(
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
            deficit.tabNav
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
            deficit.zIndex = 3 * facts.total;
          }
          else {
            inferences.zIndex = 100;
          }
          increment('zIndex');
        }
      });
      // Compute the inferred scores of package tests that failed and adjust the total score.
      const estimate = (tests, penalty) => {
        const packageScores = tests.map(test => deficit[test]).filter(score => score !== null);
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
          if (deficit[test] === null) {
            inferences[test] = meanScore + penalty;
            deficit.total += inferences[test];
          }
        });
      };
      estimate(['aatt', 'axe', 'ibm', 'wave'], 100);
    }
  }
  // Return the score facts, except for the log test.
  return {
    scoreProc: 'asp',
    version: '8',
    ruleDiscounts,
    rules,
    diffStyles,
    logWeights,
    inferences,
    deficit
  };
};
