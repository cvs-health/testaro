// a11y version 5 template placeholder replacements.
exports.parameters = (fn, testData, scoreData, scoreProc, version, orgData, testDate) => {
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
    `<p>The page <strong>did not pass</strong> all ${package} tests and received a deficit score of ${score} on ${package}. The details are in the <a href="../jsonReports/${fn}">JSON-format file</a>, in the section starting with <code>"which": "${code}"</code>. There was at least one <strong>failure</strong> of:</p>${joiner}<ul>${innerJoiner}${failures}${joiner}</ul>`;
  // Creates messages about results of custom tests.
  const customSucceedText =
    test => `<p>The page <strong>passed</strong> the <code>${test}</code> test.</p>`;
  const customFailText = (score, test) =>
    `<p>The page <strong>did not pass</strong> the ${test} test and received a deficit score of ${score} on <code>${test}</code>. The details are in the <a href="../jsonReports/${fn}">JSON-format file</a>, in the section starting with <code>"which": "${test}".</p>`;
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
    paramData.bulkResult = `The count for this page was ${testData.bulk.result.visibleElements}, resulting in a deficit score of ${deficit.bulk} on <code>bulk</code>.`;
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
  return paramData;
};
