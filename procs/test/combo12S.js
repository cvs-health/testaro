// Reduces the results of 12 tests to a score, without discounts for duplicate reporting.
exports.reduce = result => {
  // Initialize the score.
  let deficit = {total: 0};
  let facts;
  if (typeof result === 'object') {
    // Identify the object containing the scorable results of a custom test.
    const scorablesOf = (test, prop) => {
      let scorables = result[test] && result[test].result;
      if (scorables && prop) {
        scorables = scorables[prop];
      }
      return scorables;
    };
    // axeS
    facts = result.axeS && result.axeS.violations;
    if (facts) {
      deficit.axeS
        = 2 * facts.minor + 3 * facts.moderate + 4 * facts.serious + 5 * facts.critical
        || 0;
      deficit.total += deficit.axeS;
    }
    // ibmS
    facts = scorablesOf('ibmS', 'totals');
    if (facts) {
      deficit.ibmS = 4 * facts.violation + 2 * facts.recommendation || 0;
      deficit.total += deficit.ibmS;
    }
    // wave1
    facts = result.wave1 && result.wave1.categories;
    if (facts) {
      deficit.wave1 = 2 * facts.alert.count + 3 * facts.contrast.count + 4 * facts.error.count || 0;
      deficit.total += deficit.wave1;
    }
    // bulk
    facts = scorablesOf('bulk', '');
    if (facts) {
      // Deficit: square root of the excess of the element count over 150.
      deficit.bulk = Math.floor(Math.sqrt(Math.max(0, facts.visibleElements - 150))) || 0;
      deficit.total += deficit.bulk;
    }
    // focOlS
    facts = scorablesOf('focOlS', 'totals');
    facts = facts ? facts.types : null;
    facts = facts ? facts.outlineMissing : null;
    if (facts) {
      deficit.focOlS = 4 * facts.total || 0;
      deficit.total += deficit.focOlS;
    }
    // focOpS
    facts = scorablesOf('focOpS', 'totals');
    if (facts) {
      deficit.focOpS
        = 4 * facts.operableNotFocusable.total + 1 * facts.focusableNotOperable.total || 0;
      deficit.total += deficit.focOpS;
    }
    // hoverS
    facts = scorablesOf('hoverS', 'totals');
    if (facts) {
      deficit.hoverS = 4 * facts.triggers + 2 * facts.targets || 0;
      deficit.total += deficit.hoverS;
    }
    // labClashS
    facts = scorablesOf('labClashS', 'totals');
    if (facts) {
      deficit.labClashS = 2 * facts.mislabeled + 4 * facts.unlabeled || 0;
      deficit.total += deficit.labClashS;
    }
    // linkUlS
    facts = scorablesOf('linkUlS', 'totals');
    facts = facts ? facts.inline : null;
    if (facts) {
      deficit.linkUlS = 3 * (facts.total - facts.underlined) || 0;
      deficit.total += deficit.linkUlS;
    }
    // radioSetS
    facts = scorablesOf('radioSetS', 'totals');
    if (facts) {
      deficit.radioSetS = 3 * (facts.total - facts.inSet) || 0;
      deficit.total += deficit.radioSetS;
    }
    // roleS
    facts = scorablesOf('roleS', '');
    if (facts) {
      deficit.roleS = 3 * facts.badRoleElements || 0;
      deficit.total += deficit.roleS;
    }
    // styleDiffS
    facts = scorablesOf('styleDiffS', 'totals');
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
      deficit.styleDiffS = Math.floor(deficits.reduce(
        (total, currentPair) => total + 2 * currentPair[0] + 0.2 * currentPair[1], 0
      ));
      deficit.total += deficit.styleDiffS;
    }
  }
  // Return the score.
  return deficit;
};
