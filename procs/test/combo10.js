// Reduces results of 10 tests to a score.
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
    // Identify the object containing the scorable results of a custom test.
    const resultOf = (test, prop) => {
      let result = result[test] && result[test].result;
      if (result && prop) {
        result = result[prop];
      }
      return result;
    };
    // linkUlS
    facts = resultOf('linkUlS', 'inline');
    if (facts) {
      deficit.linkUlS = 3 * (facts.total - facts.underlined) || 0;
      deficit.total += deficit.linkUlS;
    }
    // focOlS
    facts = resultOf('focOlS', 'totals');
    facts = facts ? facts.types : null;
    facts = facts ? facts.outlineMissing : null;
    if (facts) {
      deficit.focOlS = 4 * facts.total || 0;
      deficit.total += deficit.focOlS;
    }
    // focOpS
    facts = resultOf('focOpS', 'totals');
    if (facts) {
      deficit.focOpS
        = 4 * facts.operableNotFocusable.total + 1 * facts.focusableNotOperable.total || 0;
      deficit.total += deficit.focOpS;
    }
    // labClashS (facts.unlabeled disregarded because covered by axeS)
    facts = resultOf('labClashS', 'totals');
    if (facts) {
      deficit.labClashS = 2 * facts.mislabeled + 0 * facts.unlabeled || 0;
      deficit.total += deficit.labClashS;
    }
    // radioSetS
    facts = resultOf('radioSetS', 'totals');
    if (facts) {
      deficit.radioSetS = 3 * (facts.total - facts.inSet) || 0;
      deficit.total += deficit.radioSetS;
    }
    // roleS
    facts = resultOf('roleS', '');
    if (facts) {
      deficit.roleS = 3 * facts.badRoleElements || 0;
      deficit.total += deficit.roleS;
    }
    // styleDiffS
    facts = resultOf('styleDiffS', 'totals');
    if (facts) {
      // Identify an array of objects having tag-name totals and style distributions as values.
      const tagNameCounts = Object.values(facts);
      /*
        Deficit: sum of the tag-name deficits, where a tag-name deficit is the sum of its
        style deficits, where a style deficit is 1 less than the square root of the quotient
        of the count of the elements with the tag name and the count of those elements with
        the style. Example: 3 h1 elements are partitioned by style into 1 and 2. Style deficits
        are sqrt(3) - 1 and sqrt(1.5) - 1. Deficit for h1 is the sum of those.
      */
      deficit.styleDiffS = Math.floor(tagNameCounts.reduce((testDeficit, currentItem) => {
        if (currentItem.subtotals) {
          return testDeficit + currentItem.subtotals.reduce((itemDeficit, currentSub) => {
            return itemDeficit + currentSub * (Math.sqrt(currentItem.total / currentSub) - 1);
          }, 0);
        }
        else {
          return testDeficit;
        }
      }, 0));
      deficit.total += deficit.styleDiffS;
    }
    // bulk
    facts = resultOf('bulk', '');
    if (facts) {
      // Deficit: square root of the excess of the element count over 150.
      deficit.bulk = Math.floor(Math.sqrt(Math.max(0, facts.visibleElements - 150))) || 0;
      deficit.total += deficit.bulk;
    }
  }
  // Return the score.
  return deficit;
};
