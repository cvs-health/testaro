// Reduces results of 6 tests to a score.
exports.reduce = result => {
  // Initialize the score.
  let score = 0;
  let bads;
  // Add weighted absolute test results to the score.
  // axeS
  const {elementCount} = result.axeS;
  bads = result.axeS.violations;
  score += 2 * bads.minor + 3 * bads.moderate + 4 * bads.serious + 5 * bads.critical;
  // wave1
  bads = result.wave1.categories;
  score += 2 * bads.alert.count + 3 * bads.contrast.count + 4 * bads.error.count;
  // linkUlS
  bads = result.linkUlS.result.inline;
  score += 3 * (bads.total - bads.underlined);
  // focusOutlineS
  bads = result.focusOutlineS.result;
  score += 4 * (bads.focusableCount - bads.outlinedCount);
  // focOpS
  bads = result.focOpS.result;
  score += 4 * bads.operableButNotFocusable.total + 2 * bads.focusableButNotOperable.total;
  // labClashS
  // Add a relative amount to the score.
  score += Math.floor(8 * score / result.axeS.elementCount);
  // Add the score to the result.
  return score;
};
