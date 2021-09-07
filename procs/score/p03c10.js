// Computes and reports a score from 3 packages and 10 custom tests, with discounts.
exports.score = result => {
  // Initialize the score.
  let deficit = {
    total: 0,
    axe: 0,
    ibm: 0,
    wave4: 0,
    bulk: 0,
    focOl: 0,
    focOp: 0,
    hover: 0,
    labClash: 0,
    linkUl: 0,
    motion: 0,
    radioSet: 0,
    role: 0,
    styleDiff: 0
  };
  let facts;
  if (typeof result === 'object') {
    // Discounts from deficit scores based on multi-test reporting of the same faults.
    const ruleDiscounts = {
      axe: {
        'aria-allowed-role': 1,
        'aria-roles': 2,
        'color-contrast': 2,
        'image-redundant-alt': 1,
        'label': 3,
        'link-name': 2,
        'region': 1
      },
      ibm: {
        'aria_semantics_role': 2,
        'IBMA_Color_Contrast_WCAG2AA': 2,
        'Rpt_Aria_OrphanedContent_Native_Host_Sematics': 2,
        'Rpt_Aria_ValidIdRef': 2,
        'Rpt_Aria_ValidRole': 2,
        'WCAG20_A_HasText': 2,
        'WCAG20_Fieldset_HasLegend': 3,
        'WCAG20_Input_ExplicitLabel': 2,
        'WCAG20_Input_RadioChkInFieldSet': 3
      },
      wave4: {
        'alt_redundant': 1,
        'aria_reference_broken': 2,
        'contrast': 1,
        'fieldset_missing': 1,
        'label_orphaned': 1,
        'legend_missing': 1,
        'link_empty': 2,
        'select_missing_label': 1
      }
    };
    // Identify the object containing the scorable results of a custom test.
    const scorablesOf = (test, prop) => {
      let scorables = result[test] && result[test].result;
      if (scorables && prop) {
        scorables = scorables[prop];
      }
      return scorables;
    };
    // axe
    facts = result.axe && result.axe.violations;
    if (facts) {
      const rules = result.axe.items;
      let totalDiscount = 0;
      rules.forEach(rule => {
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
        - totalDiscount
        || 0;
      deficit.total += deficit.axe;
    }
    // ibm
    facts = scorablesOf('ibm', 'totals');
    if (facts) {
      const rules = result.ibm.result.items;
      let totalDiscount = 0;
      rules.forEach(rule => {
        const ruleDiscount = ruleDiscounts.ibm[rule.ruleId];
        if (ruleDiscount) {
          totalDiscount += ruleDiscount;
        }
      });
      deficit.ibm = 4 * facts.violation + 2 * facts.recommendation - totalDiscount || 0;
      deficit.total += deficit.ibm;
    }
    // wave4
    facts = result.wave4 && result.wave4.categories;
    if (facts) {
      let totalDiscount = 0;
      ['error', 'contrast', 'alert'].forEach(level => {
        const items = facts[level].items;
        const rules = Object.keys(items);
        rules.forEach(rule => {
          const ruleDiscount = ruleDiscounts.wave4[rule] * items[rule].count;
          if (ruleDiscount) {
            totalDiscount += ruleDiscount;
          }
        });
      });
      deficit.wave4
        = 2 * facts.alert.count + 3 * facts.contrast.count + 4 * facts.error.count - totalDiscount
        || 0;
      deficit.total += deficit.wave4;
    }
    // bulk
    facts = scorablesOf('bulk', '');
    if (facts) {
      // Deficit: square root of the excess of the element count over 150.
      deficit.bulk = Math.floor(Math.sqrt(Math.max(0, facts.visibleElements - 150))) || 0;
      deficit.total += deficit.bulk;
    }
    // focOl
    facts = scorablesOf('focOl', 'totals');
    facts = facts ? facts.types : null;
    facts = facts ? facts.outlineMissing : null;
    if (facts) {
      deficit.focOl = 4 * facts.total || 0;
      deficit.total += deficit.focOl;
    }
    // focOp
    facts = scorablesOf('focOp', 'totals');
    if (facts) {
      deficit.focOp
        = 4 * facts.operableNotFocusable.total + 1 * facts.focusableNotOperable.total || 0;
      deficit.total += deficit.focOp;
    }
    // hover
    facts = scorablesOf('hover', 'totals');
    if (facts) {
      deficit.hover = 4 * facts.triggers + 2 * facts.targets || 0;
      deficit.total += deficit.hover;
    }
    // labClash (facts.unlabeled discounted)
    facts = scorablesOf('labClash', 'totals');
    if (facts) {
      deficit.labClash = 2 * facts.mislabeled + 2 * facts.unlabeled || 0;
      deficit.total += deficit.labClash;
    }
    // linkUl
    facts = scorablesOf('linkUl', 'totals');
    facts = facts ? facts.inline : null;
    if (facts) {
      deficit.linkUl = 3 * (facts.total - facts.underlined) || 0;
      deficit.total += deficit.linkUl;
    }
    // motion
    facts = scorablesOf('motion', 'ratio');
    if (facts) {
      deficit.motion = 50 * (facts - 1) || 0;
      deficit.total += deficit.motion;
    }
    // radioSet (discounted)
    facts = scorablesOf('radioSet', 'totals');
    if (facts) {
      deficit.radioSet = 2 * (facts.total - facts.inSet) || 0;
      deficit.total += deficit.radioSet;
    }
    // role (discounted)
    facts = scorablesOf('roleS', '');
    if (facts) {
      deficit.role = 2 * facts.badRoleElements || 0;
      deficit.total += deficit.role;
    }
    // styleDiff
    facts = scorablesOf('styleDiff', 'totals');
    if (facts) {
      // Identify an array of objects having tag-name totals and style distributions as values.
      const tagNameCounts = Object.values(facts);
      // Identify an array of pairs of counts of (1) excess styles and (2) nonplurality elements.
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
      deficit.total += deficit.styleDiff;
    }
  }
  // Return the score.
  return deficit;
};
