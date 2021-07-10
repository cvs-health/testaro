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
    // labClashS (facts.unlabeled disregarded because covered by axeS)
    facts = result.labClashS && result.labClashS.result && result.labClashS.result.totals;
    if (facts) {
      deficit.labClashS = 2 * facts.mislabeled + 0 * facts.unlabeled;
      deficit.total += deficit.labClashS;
    }
    // radioSetS
    facts = result.radioSetS && result.radioSetS.result && result.radioSetS.result.totals;
    if (facts) {
      deficit.radioSetS = 3 * (facts.total - facts.inSet);
      deficit.total += deficit.radioSetS;
    }
    // roleS
    facts = result.roleS && result.roleS.result;
    if (facts) {
      deficit.roleS = 3 * facts.badRoleElements;
      deficit.total += deficit.roleS;
    }
    // styleDiffS
    facts = result.styleDiffS && result.styleDiffS.result && result.styleDiffS.result.totals;
    if (facts) {
      const items = Object.values(facts);
      deficit.styleDiffs = items.reduce((testDeficit, currentItem) => {
        if (currentItem.subtotals) {
          return testDeficit + currentItem.subtotals.reduce((itemDeficit, currentSub) => {
            return itemDeficit + currentSub * (Math.sqrt(currentItem.total / currentSub) - 1);
          }, 0);
        }
        else {
          return testDeficit;
        }
      }, 0);
      deficit.total += deficit.styleDiffS;
    }
    // bulk
    facts = result.bulk && result.bulk.result;
    if (facts) {
      deficit.bulk = Math.floor(Math.sqrt(Math.max(0, facts.visibleElements - 150)));
      deficit.total += deficit.bulk;
    }
  }
  // Return the score.
  return deficit;
};
