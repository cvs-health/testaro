// Computes and reports a score from 3 packages and 13 custom tests, with discounts.
exports.scorer = acts => {
  // Define the configuration disclosures.
  const logWeights = {
    count: 1.5,
    size: 0.02
  };
  const rules = {};
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
    axe: null,
    ibm: null,
    wave: null,
    bulk: null,
    embAc: null,
    focInd: null,
    focOl: null,
    focOp: null,
    hover: null,
    labClash: null,
    linkUl: null,
    motion: null,
    radioSet: null,
    role: null,
    styleDiff: null,
    logCount: null,
    logSize: null
  };
  let facts;
  if (Array.isArray(acts)) {
    const tests = acts.filter(act => act.type === 'test');
    // Discounts from deficit scores based on multi-test reporting of the same faults.
    ruleDiscounts.axe = {
      'aria-allowed-role': 1,
      'aria-roles': 2,
      'color-contrast': 2,
      'image-redundant-alt': 1,
      'label': 3,
      'link-name': 2,
      'region': 1
    };
    ruleDiscounts.ibm = {
      'aria_semantics_role': 2,
      'IBMA_Color_Contrast_WCAG2AA': 2,
      'Rpt_Aria_OrphanedContent_Native_Host_Sematics': 2,
      'Rpt_Aria_ValidIdRef': 2,
      'Rpt_Aria_ValidRole': 2,
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
    const increment = test => {
      deficit.total += deficit[test] || inferences[test];
    };
    tests.forEach(test => {
      const {which} = test;
      if (which === 'axe') {
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
        facts = test.result && test.result.totals;
        if (facts) {
          rules.ibm = 'multiply violations by 4, recommendatons by 2; sum; subtract discounts';
          const ibmRules = test.result.items || [];
          let totalDiscount = 0;
          ibmRules.forEach(rule => {
            const ruleDiscount = ruleDiscounts.ibm[rule.ruleId];
            if (ruleDiscount) {
              totalDiscount += ruleDiscount;
            }
          });
          deficit.ibm = 4 * facts.violation + 2 * facts.recommendation - totalDiscount;
          deficit.total += deficit.ibm;
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
          rules.bulk = 'subtract 150 from visible elements; make 0 if negative; raise to 0.9th power; multiply by 0.15';
          // Deficit: 15% of the excess, to the 0.9th power, of the element count over 150.
          deficit.bulk = Math.floor(0.15 * Math.pow(Math.max(0, facts - 150), 0.9));
        }
        else {
          inferences.bulk = 100;
        }
        increment('bulk');
      }
      else if (which === 'embAc') {
        facts = test.result && test.result.totals;
        if (facts) {
          rules.embAc = 'multiply link- or button-contained links, buttons, inputs, and selects by 4';
          deficit.embAc = 4 * (facts.links + facts.buttons + facts.inputs + facts.selects);
        }
        else {
          inferences.embAc = 100;
        }
        increment('embAc');
      }
      else if (which === 'focInd') {
        facts = test.result && test.result.totals;
        facts = facts ? facts.types : null;
        facts = facts ? facts.indicatorMissing : null;
        if (facts) {
          rules.focInd = 'multiply indicatorless-when-focused elements by 5';
          deficit.focInd = 5 * facts.total;
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
          rules.focOl = 'multiply outlineless-when-focused elements by 3';
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
            = 4 * facts.operableNotFocusable.total + 1 * facts.focusableNotOperable.total;
        }
        else {
          inferences.focOp = 150;
        }
        increment('focOp');
      }
      else if (which === 'hover') {
        facts = test.result && test.result.totals;
        if (facts) {
          rules.hover = 'multiply elements adding visible content when hovered by 4, elements made visible by 2; sum';
          deficit.hover = 4 * facts.triggers + 2 * facts.targets;
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
      else if (which === 'motion') {
        facts = test.result;
        if (facts && facts.bytes) {
          rules.motion = 'get PNG screenshot sizes (sss); get differing-pixel counts between adjacent PNG screenshots (pd); “sssd” = sss difference ÷ smaller sss; multiply mean adjacent sssd, maximum adjacent sssd, maximum over-all ssd by 15; divide mean pd, maximum pd by 25,000; multiply count of non-0 pd by 10; sum';
          deficit.motion = Math.floor(
            15 * (facts.meanLocalRatio - 1)
            + 15 * (facts.maxLocalRatio - 1)
            + 15 * (facts.globalRatio - 1)
            + facts.meanPixelChange / 25000
            + facts.maxPixelChange / 25000
            + 10 * facts.changeFrequency
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
    });
    // If at least 1 test package but not all test packages failed, assign penalty deficits.
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
    estimate(['axe', 'ibm', 'wave'], 100);
  }
  // Return the score, except for the log test.
  return {
    ruleDiscounts,
    rules,
    diffStyles,
    logWeights,
    inferences,
    deficit
  };
};
