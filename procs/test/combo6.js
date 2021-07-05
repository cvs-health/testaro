// Reduces results of 6 tests to a score.
exports.reduce = result => {
  // Initialize the score.
  let deficit = 0;
  let facts;
  if (typeof result === 'object') {
    // axeS
    facts = result.axeS && result.axeS.violations;
    if (facts) {
      deficit += 2 * facts.minor + 3 * facts.moderate + 4 * facts.serious + 5 * facts.critical;
    }
    // wave1
    facts = result.wave1 && result.wave1.categories;
    if (facts) {
      deficit += 2 * facts.alert.count + 3 * facts.contrast.count + 4 * facts.error.count;
    }
    // linkUlS
    facts = result.linkUlS && result.linkUlS.result;
    if (facts) {
      deficit += 3 * (facts.inLinkCount - facts.underlined);
    }
    // focusOutlineS
    facts = result.focusOutlineS && result.focusOutlineS.result;
    if (facts) {
      deficit += 4 * (facts.focusableCount - facts.outlinedCount);
    }
    // focOpS
    facts = result.focOpS && result.focOpS.result;
    if (facts) {
      deficit += 4 * facts.operableNotFocusable.total + 1 * facts.focusableNotOperable.total;
    }
    // labClashS
    facts = result.labClashS && result.labClashS.result && result.labClashS.result.totals;
    if (facts) {
      deficit += 2 * facts.misLabeled + 4 * facts.unlabeled;
    }
  }
  // Return the score.
  return deficit;
};
