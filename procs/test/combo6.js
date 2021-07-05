// Reduces results of 6 tests to a score.
exports.reduce = result => {
  // Initialize the score.
  let deficit = {total: 0};
  let facts;
  if (typeof result === 'object') {
    // axeS
    facts = result.axeS && result.axeS.violations;
    if (facts) {
      deficit.axeS = 2 * facts.minor + 3 * facts.moderate + 4 * facts.serious + 5 * facts.critical;
      deficit.total += deficit.axeS;
    }
    // wave1
    facts = result.wave1 && result.wave1.categories;
    if (facts) {
      deficit.wave1 = 2 * facts.alert.count + 3 * facts.contrast.count + 4 * facts.error.count;
      deficit.total += deficit.wave1;
    }
    // linkUlS
    facts = result.linkUlS && result.linkUlS.result && result.linkUlS.result.inline;
    if (facts) {
      deficit.linkUlS = 3 * (facts.total - facts.underlined);
      deficit.total += deficit.linkUlS;
    }
    // focusOutlineS
    facts = result.focusOutlineS && result.focusOutlineS.result;
    if (facts) {
      deficit.focusOutlineS = 4 * (facts.focusableCount - facts.outlinedCount);
      deficit.total += deficit.focusOutlineS;
    }
    // focOpS
    facts = result.focOpS && result.focOpS.result && result.focOpS.result.totals;
    if (facts) {
      deficit.focOpS = 4 * facts.operableNotFocusable.total + 1 * facts.focusableNotOperable.total;
      deficit.total += deficit.focOpS;
    }
    // labClashS
    facts = result.labClashS && result.labClashS.result && result.labClashS.result.totals;
    if (facts) {
      deficit.labClashS = 2 * facts.mislabeled + 4 * facts.unlabeled;
      deficit.total += deficit.labClashS;
    }
  }
  // Return the score.
  return deficit;
};
