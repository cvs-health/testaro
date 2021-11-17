// a11y version 6 template placeholder replacements.
exports.parameters = (
  fn, sourceData, testData, scoreData, scoreProc, version, orgData, testDate
) => {
  // Makes strings HTML-safe.
  const htmlEscape = textOrNumber => textOrNumber
  .toString()
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;');
  // Newlines with indentations.
  const joiner = '\n      ';
  const innerJoiner = '\n        ';
  // Creates messages about results of packaged tests.
  const packageSucceedText = package =>
    `<p>The page <strong>passed</strong> all ${package} tests.</p>`;
  const packageFailText = (score, package, code, failures) =>
    `<p>The page <strong>did not pass</strong> all ${package} tests and received a deficit score of ${score} on ${package}. The details are in the <a href="../jsonReports/${fn}">JSON-format file</a>, in the section starting with <code>"which": "${code}"</code>. There was at least one failure of:</p>${joiner}<ul>${innerJoiner}${failures}${joiner}</ul>`;
  // Creates messages about results of custom tests.
  const customSucceedText =
    test => `<p>The page <strong>passed</strong> the <code>${test}</code> test.</p>`;
  const customFailText = (score, test) =>
    `<p>The page <strong>did not pass</strong> the <code>${test}</code> test and received a deficit score of ${score} on <code>${test}</code>. The details are in the <a href="../jsonReports/${fn}">JSON-format file</a>, in the section starting with <code>"which": "${test}"</code>.</p>`;
  const customFailures = failObj => Object
  .entries(failObj)
  .map(entry => `<li>${entry[0]}: ${entry[1]}</li>`)
  .join(innerJoiner);
  const customFailMore = failures =>
    `<p>Summary of the details:</p>${joiner}<ul>${innerJoiner}${failures}${joiner}</ul>`;
  const customResult = (score, test, failures) =>
    `${customFailText(score, test)}${joiner}${customFailMore(failures)}`;
  // Get general data for scoreDoc.
  const paramData = {};
  const date = new Date();
  paramData.dateISO = date.toISOString().slice(0, 10);
  paramData.dateSlash = paramData.dateISO.replace(/-/g, '/');
  paramData.file = fn;
  paramData.testDate = testDate;
  paramData.scoreProc = scoreProc;
  paramData.version = version;
  paramData.org = orgData.what;
  paramData.url = orgData.which;
  const {deficit} = scoreData;
  paramData.totalScore = deficit.total;
  // Get package-test result messages for scoreDoc.
  if (deficit.axe) {
    const axeFailures = testData.axe.result.items.map(
      item => `<li>${item.rule}: ${htmlEscape(item.description)}</li>`
    ).join(innerJoiner);
    paramData.axeResult = packageFailText(deficit.axe, 'Axe', 'axe', axeFailures);
  }
  else {
    paramData.axeResult = packageSucceedText('Axe');
  }
  if (deficit.ibm) {
    const ibmFailures = Array.from(new Set(testData.ibm.result.content.items.map(
      item => `<li>${item.ruleId}: ${htmlEscape(item.message)}</li>`
    )).values()).join(innerJoiner);
    paramData.ibmResult = packageFailText(deficit.ibm, 'Equal Access', 'ibm', ibmFailures);
  }
  else {
    paramData.ibmResult = packageSucceedText('Equal Access');
  }
  if (deficit.wave) {
    const waveResult = testData.wave.result.categories;
    const waveItems = [];
    ['error', 'contrast', 'alert'].forEach(category => {
      waveItems.push(
        ... Object
        .entries(waveResult[category].items)
        .map(entry => `<li>${category}/${entry[0]}: ${entry[1].description}</li>`)
      );
    });
    const waveFailures = waveItems.join(innerJoiner);
    paramData.waveResult = packageFailText(deficit.wave, 'WAVE', 'wave', waveFailures);
  }
  else {
    paramData.waveResult = packageSucceedText('WAVE');
  }
  if (deficit.bulk) {
    paramData.bulkResult = `The page <strong>did not pass</strong> the <code>bulk</code> test. The count of visible elements in the page was ${testData.bulk.result.visibleElements}, resulting in a deficit score of ${deficit.bulk} on <code>bulk</code>.`;
  }
  else {
    paramData.bulkResult = customSucceedText('bulk');
  }
  if (deficit.embAc) {
    const failures = customFailures(testData.embAc.result.totals);
    paramData.embAcResult = customResult(deficit.embAc, 'embAc', failures);
  }
  else {
    paramData.embAcResult = customSucceedText('embAc');
  }
  if (deficit.focAll) {
    const failures = customFailures(testData.focAll.result);
    paramData.focAllResult = customResult(deficit.focAll, 'focAll', failures);
  }
  else {
    paramData.focAllResult = customSucceedText('focAll');
  }
  if (deficit.focInd) {
    const failSource = testData.focInd.result.totals.types;
    const failObj = {
      indicatorMissing: failSource.indicatorMissing.total,
      nonOutlinePresent: failSource.nonOutlinePresent.total
    };
    const failures = customFailures(failObj);
    paramData.focIndResult = customResult(deficit.focInd, 'focInd', failures);
  }
  else {
    paramData.focIndResult = customSucceedText('focInd');
  }
  if (deficit.focOp) {
    const failSource = testData.focOp.result.totals.types;
    const failObj = {
      onlyFocusable: failSource.onlyFocusable.total,
      onlyOperable: failSource.onlyOperable.total
    };
    const failures = customFailures(failObj);
    paramData.focOpResult = customResult(deficit.focOp, 'focOp', failures);
  }
  else {
    paramData.focOpResult = customSucceedText('focOp');
  }
  if (deficit.hover) {
    const failures = customFailures(testData.hover.result.totals);
    paramData.hoverResult = customResult(deficit.hover, 'hover', failures);
  }
  else {
    paramData.hoverResult = customSucceedText('hover');
  }
  if (deficit.labClash) {
    const {totals} = testData.labClash.result;
    delete totals.wellLabeled;
    const failures = customFailures(totals);
    paramData.labClashResult = customResult(deficit.labClash, 'labClash', failures);
  }
  else {
    paramData.labClashResult = customSucceedText('labClash');
  }
  if (deficit.linkUl) {
    const failures = customFailures(testData.linkUl.result.totals.inline);
    paramData.linkUlResult = customResult(deficit.linkUl, 'linkUl', failures);
  }
  else {
    paramData.linkUlResult = customSucceedText('linkUl');
  }
  if (deficit.log) {
    const {logCount, logSize, visitRejectionCount, prohibitedCount, visitTimeoutCount} = sourceData;
    const logData = {logCount, logSize, visitRejectionCount, prohibitedCount, visitTimeoutCount};
    const failures = customFailures(logData);
    paramData.logResult = customResult(deficit.log, 'log', failures);
  }
  else {
    paramData.logResult = customSucceedText('log');
  }
  if (deficit.menuNav) {
    const failSource = customFailures(testData.menuNav.result.totals);
    const failObj = {
      navigations: failSource.navigations.all,
      menuItems: failSource.menuItems,
      menus: failSource.menus
    };
    const failures = customFailures(failObj);
    paramData.menuNavResult = customResult(deficit.menuNav, 'menuNav', failures);
  }
  else {
    paramData.menuNavResult = customSucceedText('menuNav');
  }
  if (deficit.motion) {
    const {result} = testData.motion;
    result.bytes = result.bytes.join(', ');
    result.localRatios = result.localRatios.join(', ');
    result.pixelChanges = result.pixelChanges.join(', ');
    const failures = customFailures(result);
    paramData.motionResult = customResult(deficit.motion, 'motion', failures);
  }
  else {
    paramData.motionResult = customSucceedText('motion');
  }
  if (deficit.radioSet) {
    const failures = customFailures(testData.radioSet.result.totals);
    paramData.radioSetResult = customResult(deficit.radioSet, 'radioSet', failures);
  }
  else {
    paramData.radioSetResult = customSucceedText('radioSet');
  }
  if (deficit.role) {
    const {result} = testData.role;
    delete result.tagNames;
    const failures = customFailures(result);
    paramData.roleResult = customResult(deficit.role, 'role', failures);
  }
  else {
    paramData.roleResult = customSucceedText('role');
  }
  if (deficit.styleDiff) {
    const {totals} = testData.styleDiff.result;
    const styleCounts = {};
    Object.keys(totals).forEach(key => {
      const data = totals[key];
      const count = data.subtotals ? data.subtotals.length : 1;
      styleCounts[key] = `${count} ${count === 1 ? 'style' : 'different styles'}`;
    });
    const failures = customFailures(styleCounts);
    paramData.styleDiffResult = customResult(deficit.styleDiff, 'styleDiff', failures);
  }
  else {
    paramData.roleResult = customSucceedText('role');
  }
  if (deficit.tabNav) {
    const failSource = customFailures(testData.tabNav.result.totals);
    const failObj = {
      navigations: failSource.navigations.all,
      tabElements: failSource.tabElements,
      tabLists: failSource.tabLists
    };
    const failures = customFailures(failObj);
    paramData.tabNavResult = customResult(deficit.tabNav, 'tabNav', failures);
  }
  else {
    paramData.tabNavResult = customSucceedText('tabNav');
  }
  if (deficit.zIndex) {
    const {tagNames} = testData.zIndex.result.totals;
    const failures = customFailures(tagNames);
    paramData.zIndexResult = customResult(deficit.zIndex, 'zIndex', failures);
  }
  else {
    paramData.zIndexResult = customSucceedText('zIndex');
  }
  return paramData;
};
